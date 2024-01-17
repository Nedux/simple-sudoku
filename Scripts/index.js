let refToBoard = [];
const HIDE_CLASS = 'hide';
const PRE_FILLED_CLASS = 'pre-filled';
const INPUT_REGEX = /^[1-9]$/;

let board; // 2d array of size: board_h x board_w 
let board_solution = ""; // Storing the solution as a string
let board_w = 0;
let board_h = 0;
let board_diff = "None";


let tableDomNode = document.body.querySelectorAll("table")[0];

GetNewBoardData();

let resetBtnDomN = document.body.getElementsByClassName("reset-btn")[0];
resetBtnDomN.addEventListener("click", ResetInput);

let errBlockDomN = document.body.getElementsByClassName('err')[0];

let succBlockDomN = document.body.getElementsByClassName('succ')[0];

let submitBtnDomN = document.body.getElementsByClassName("submit-btn")[0];
submitBtnDomN.addEventListener("click", SubmitDataWithDelay);

let fillBtnDomN = document.body.getElementsByClassName('fill-btn')[0];
fillBtnDomN.addEventListener("click", FillData);

let newBtnDomN = document.body.getElementsByClassName('new-btn')[0];
newBtnDomN.addEventListener("click", GetNewBoardData);

function GetNewBoardData()
{
    // TODO insert loading wheel here.
    ClearBoard();

    GetBoardData().then(jsonData => {
        board = jsonData.newboard.grids[0].value;
        board_solution = ConvertMatrixToString(jsonData.newboard.grids[0].solution);
        
        board_w = jsonData.newboard.grids[0].value.length;
        board_h = jsonData.newboard.grids[0].value[0].length;
        board_diff = jsonData.newboard.grids[0].difficulty;

        var diffTextDomN  = document.body.getElementsByClassName('diff-text')[0];
        diffTextDomN.innerHTML = board_diff;
        
        InitBoard(board_w, board_h);
    });
}

function ClearBoard()
{
    while(tableDomNode.hasChildNodes())
        tableDomNode.removeChild(tableDomNode.firstChild)
    
    refToBoard = [];
    board_solution = "";
    board_w = 0;
    board_h = 0;
    board_diff = "Unknown";
}

function InitBoard(board_h, board_w)
{
    if(tableDomNode && board_h > 0 && board_w > 0)
    {
        for(var i = 0; i < board_h; i++)
        {
            const row = document.createElement('tr');
            for(var j = 0; j < board_w; j++)
            {
                const inputDomN = CreateInput(i, j);
                
                var arrIndex = i * board_h + j;
                refToBoard[arrIndex] = inputDomN;
                const data = document.createElement('td');
                data.appendChild(inputDomN);
                row.appendChild(data);
            }
            tableDomNode.appendChild(row);
        }
    }
}

function CreateInput(y, x){
    let inputDomN;

    if(board[y][x] !== 0){  
        inputDomN = document.createElement('div');
        inputDomN.innerHTML = board[y][x];
        inputDomN.disabled = true;
        inputDomN.classList.add(PRE_FILLED_CLASS);          
    } 
    else{
        inputDomN = document.createElement('input');
        inputDomN.setAttribute("type", "string");
        inputDomN.setAttribute("autocomplete", "off");
        inputDomN.addEventListener("input", (e)=>{  
            if(!(INPUT_REGEX.test(e.target.value))){
                e.target.value =  e.target.value.slice(0, -1);
            }
        });
    }
    
    return inputDomN;
}

function ResetInput(){
    ToggleError(false);
    ToggleSucess(false);
    
    for(var i = 0; i < board_h; i++){
        for(var j = 0; j < board_w; j++){
            var refToBoardIndex = i * board_h + j;
            if(board[i][j] !== 0){
                refToBoard[refToBoardIndex].value = board[i][j];
            }
            else{
                refToBoard[refToBoardIndex].value = '';
            }
        }
    }
}

function SubmitDataWithDelay(){
    // Users should know that the error was refreshed
    if(!errBlockDomN.classList.contains(HIDE_CLASS))
    {
        ToggleError(false);
        setTimeout(SubmitData, 500)
    }
    else
    {
        SubmitData();
    }
}

function SubmitData(){
    let sumbitedData = [];
    
    for(let i = 0; i < board_h * board_w; i++){
        if(refToBoard[i].value === ''){
            ShowError("Please fill all of the values!");
            return;
        }
        sumbitedData[i] = refToBoard[i].value;
    }
    ToggleError(false);
    sumbitedData = sumbitedData.join('');
    if(board_solution === ""){
        GetSolutionData().then(jsonData => {
            board_solution = jsonData.solution;
            checkSolution(sumbitedData);
        });
    }
    else{
        checkSolution(sumbitedData);
    }
}

function checkSolution(solution){
    if(solution === board_solution){
        ShowSuccess("The solution is correct!")
    }
    else{
        ShowError("Solution is incorect!");
    }
}

function ShowError(text){
    errBlockDomN.childNodes[1].innerHTML = text;
    ToggleSucess(false);
    ToggleError(true);
}

function ToggleError(show){
    if(show){
        errBlockDomN.classList.remove(HIDE_CLASS);
    }
    else{
        errBlockDomN.classList.add(HIDE_CLASS);
    }
}

function ShowSuccess(text){
    succBlockDomN.childNodes[1].innerHTML = text;
    ToggleSucess(true);
}

function ToggleSucess(show){
    if(show){
        succBlockDomN.classList.remove(HIDE_CLASS);
    }
    else{
        succBlockDomN.classList.add(HIDE_CLASS);
    }
}

function FillData()
{
    for(let i = 0; i < board_h * board_w; i++){
        refToBoard[i].value = board_solution[i];
    }
}

// Helper functions

function ConvertMatrixToString(matrix)
{
    // Spreading multiple arrays in matrix and concating them to an empty array
    let array = [].concat(...matrix);
    
    let str = array.join('');
    
    return str;
}

async function GetBoardData() {
    try {
        const response = await fetch('https://sudoku-api.vercel.app/api/dosuku');  
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = response.json();

        return data;
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
}