let refToBoard = [];
const HIDE_CLASS = 'hide';
const PRE_FILLED_CLASS = 'pre-filled';
const INPUT_REGEX = /^[1-9]$/;

let board; // 2d array of size: board_h x board_w 
let board_solution = ""; // Storing the solution as a string
let board_w = 0;
let board_h = 0;
let board_diff = "None";



GetBoardData().then(jsonData => {
    board = jsonData.newboard.grids[0].value;
    board_solution = ConvertMatrixToString(jsonData.newboard.grids[0].solution);
    
    board_w = jsonData.newboard.grids[0].value.length;
    board_h = jsonData.newboard.grids[0].value[0].length;
    board_diff = jsonData.newboard.grids[0].difficulty;
    
    InitBoard(board_w, board_h);
});

let resetBtn = document.body.getElementsByClassName("reset-btn")[0];
resetBtn.addEventListener("click", ResetInput);

let errBlock = document.body.getElementsByClassName('err')[0];

let succBlock = document.body.getElementsByClassName('succ')[0];

let submitBtn = document.body.getElementsByClassName("submit-btn")[0];
submitBtn.addEventListener("click", SubmitData);

let fillBtn = document.body.getElementsByClassName('fill-btn')[0];
fillBtn.addEventListener("click", FillData);

function InitBoard(board_h, board_w)
{
    let table = document.body.querySelectorAll("table")[0];
    
    if(table && board_h > 0 && board_w > 0)
    {
        for(var i = 0; i < board_h; i++)
        {
            const row = document.createElement('tr');
            for(var j = 0; j < board_w; j++)
            {
                const input = CreateInput(i, j);
                
                var arrIndex = i * board_h + j;
                refToBoard[arrIndex] = input;
                const data = document.createElement('td');
                data.appendChild(input);
                row.appendChild(data);
            }
            table.appendChild(row);
        }
    }
}

function CreateInput(y, x){
    if(board[y][x] !== 0){  
        input = document.createElement('div');
        input.innerHTML = board[y][x];
        input.disabled = true;
        input.classList.add(PRE_FILLED_CLASS);          
    } 
    else{
        input = document.createElement('input');
        input.setAttribute("type", "string");
        input.setAttribute("autocomplete", "off");
        input.addEventListener("input", (e)=>{  
            if(!(INPUT_REGEX.test(e.target.value))){
                e.target.value =  e.target.value.slice(0, -1);
            }
        });
    }
    
    return input;
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
    errBlock.childNodes[1].innerHTML = text;
    ToggleSucess(false);
    ToggleError(true);
}

function ToggleError(show){
    if(show){
        errBlock.classList.remove(HIDE_CLASS);
    }
    else{
        errBlock.classList.add(HIDE_CLASS);
    }
}

function ShowSuccess(text){
    succBlock.childNodes[1].innerHTML = text;
    ToggleSucess(true);
}

function ToggleSucess(show){
    if(show){
        succBlock.classList.remove(HIDE_CLASS);
    }
    else{
        succBlock.classList.add(HIDE_CLASS);
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