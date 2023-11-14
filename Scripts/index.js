let refToBoard = [];
const HIDE_CLASS = 'hide';
const PRE_FILLED_CLASS = 'pre-filled';
const INPUT_REGEX = /^[1-9]$/;
let board = "";
let board_solution = "";
let board_w;
let board_h;

FetchInitialData().then(jsonData => {
    board = jsonData.board;
    board_h = jsonData.height;
    board_w = jsonData.width;
    // Testing
    // board = "534678912672195348198342567859761423426853791713924856961537284287419635345286179";
    // board_h = 9;
    // board_w = 9;

    InitBoard(board_h, board_w);
});

let resetBtn = document.body.getElementsByClassName("reset-btn")[0];
resetBtn.addEventListener("click", ResetInput);

let errBlock = document.body.getElementsByClassName('err')[0];
let succBlock = document.body.getElementsByClassName('succ')[0];

let submitBtn = document.body.getElementsByClassName("submit-btn")[0];
submitBtn.addEventListener("click", SubmitData);

function InitBoard(board_h, board_w)
{
    let table = document.body.querySelectorAll("table");
    
    if(board_h > 0 && board_w > 0)
    {
        for(let i = 0; i < board_h; i++)
        {
            const row = document.createElement('tr');
            for(let j = 0; j < board_w; j++)
            {
                const data = document.createElement('td');
                const input = document.createElement('input');
                let arrIndex = i * board_h + j;
                SetInput(input, arrIndex);
                refToBoard[arrIndex] = input;
                data.appendChild(input);
                row.appendChild(data);
            }
            table[0].appendChild(row);
        }
    }
}

function SetInput(input, index){
    input.setAttribute("type", "string");
    input.setAttribute("autocomplete", "off");
    input.addEventListener("input", (e)=>{  
        if(!(INPUT_REGEX.test(e.target.value))){
            e.target.value =  e.target.value.slice(0, -1);
        }
    });
    
    if(board[index] !== 'x'){
        input.value = board[index];
        input.disabled = true;
        input.classList.add(PRE_FILLED_CLASS);          
    }
}

function ResetInput(){
    ToggleError(false);
    ToggleSucess(false);
    for(let i = 0; i < board.length; i++){
        if(board[i] !== 'x'){
            refToBoard[i].value = board[i];
        }
        else{
            refToBoard[i].value = '';
        }
    }
}

function SubmitData(){
    let sumbitedData = [];
    for(let i = 0; i < board.length; i++){
        if(refToBoard[i].value === ''){
            ShowError("Please fill all of the values!");
            return;
        }
        sumbitedData[i] = refToBoard[i].value;
    }
    ToggleError(false);
    sumbitedData = sumbitedData.join('');
    if(board_solution === ""){
        FetchFinalData().then(jsonData => {
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

async function FetchInitialData() {
    try {
        const response = await fetch('https://6550e0cc7d203ab6626e476a.mockapi.io/api/v1/SudokuBoard/1');  
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
}

async function FetchFinalData() {
    try {
        const response = await fetch('https://6550e0cc7d203ab6626e476a.mockapi.io/api/v1/SudokuSolutions/1');  
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
}