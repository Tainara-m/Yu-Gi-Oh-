const state={
    score:{
        playerScore:0,
        computerScore:0,
        scoreBox: document.getElementById("score-points")},
        cardSprites:{
            avatar: document.getElementById("card-image"),
            name: document.getElementById("card-name"),
            type: document.getElementById("card-type")
        },
        fieldCards:{
            player: document.getElementById("player-infield-card"),
            computer: document.getElementById("computer-infield-card")},
            actions:{
            button: document.getElementById("next-duel"),
            },
    };

const playerSides = {
    player1:"player-cards",
    computer:"computer-cards",
}

const pathImages = "./src/assets/icons/"
const pathAudios = "./src/assets/audios/"

// Estado global do áudio
let isMuted = false;
let backgroundMusic = null;

const cardData = [
    {
        id:0,name:'Blue Eyes White Dragon',
        type:'Paper',
        img:`${pathImages}dragon.png`,
        WinOf:[1],
        LoseOf:[2],
    },
    {
        id:1,
        name:'Dark Magician',
        type:'Rock',
        img:`${pathImages}magician.png`,
        WinOf:[2],
        LoseOf:[0],
    },
    {
        id:2,
        name:'Exodia',
        type:'Scissors',
        img:`${pathImages}exodia.png`,
        WinOf:[0],
        LoseOf:[1],
    },
];

async function getRandomCardId() {
    const randomIndex =Math.floor( Math.random() * cardData.length);
    return cardData[randomIndex].id;
}

async function createCardImage(randomIdCard, fieldSide) {
    const cardImage = document.createElement("img");
    cardImage.setAttribute("height", "100px");
    cardImage.setAttribute("src", `${pathImages}card-back.png`);
    cardImage.setAttribute("data-id", randomIdCard);
    cardImage.classList.add("card");

    if(fieldSide === playerSides.player1){
        cardImage.classList.add("player-card");
        cardImage.addEventListener("mouseover", () => {
            drawSelectCard(randomIdCard);
        });
        cardImage.addEventListener("click", () => {
            setCardsField(cardImage.getAttribute("data-id"));
        });
    }

    return cardImage;
}

async function setCardsField(cardId) {
    await removeAllCardsImages();
    let computerCardId =     await getRandomCardId();

    // Tocar música de fundo na primeira interação
    if (!window.audioEnabled) {
        window.audioEnabled = true;
        playBackgroundMusic();
    }

    state.fieldCards.player.style.display  = "block";
    state.fieldCards.computer.style.display  = "block";

    state.fieldCards.player.src = cardData[cardId].img;
    state.fieldCards.computer.src = cardData[computerCardId].img;

    let duelResults = await checkDuelResults (cardId, computerCardId);

    await updateScore();
    await drawButton(duelResults)
}

async function drawButton(text) {
    state.actions.button.innerText = text;
    state.actions.button.style.display = "block";
}

async function checkDuelResults(playerCardId, computerCardId) {
    let duelResults = "Empate"
    let playerCard = cardData[playerCardId];

    if(playerCard.WinOf.includes(computerCardId) ){
        duelResults = "Você Ganhou :)"
        await playAudio(duelResults)
        state.score.playerScore++;
    }
    else if(playerCard.LoseOf.includes(computerCardId)){
        duelResults = "Você Perdeu :("
        await playAudio(duelResults)
        state.score.computerScore++;
    }

    return duelResults;
}

async function updateScore() {
    state.score.scoreBox.innerText = `Win: ${state.score.playerScore} | Lose: ${state.score.computerScore}`;
}

async function resetDuel() {
    state.fieldCards.player.style.display = "none";
    state.fieldCards.computer.style.display = "none";

    state.actions.button.style.display = "none";

    init();
}

async function removeAllCardsImages() {
    let cards = document.querySelector("#computer-cards");
    let imgElements = cards.querySelectorAll("img");
    imgElements.forEach(img => img.remove());

    cards = document.querySelector("#player-cards");
    let playerImgElements = cards.querySelectorAll("img");
    playerImgElements.forEach(img => img.remove());
}

async function drawSelectCard(index) {
    state.cardSprites.avatar.src = cardData[index].img;
    state.cardSprites.name.innerText = cardData[index].name;
    state.cardSprites.type.innerText = "Atributte:" + cardData[index].type;
}

async function drawCards(cardNumbers, fieldSide) {
    for(let i=0; i<cardNumbers; i++){
        const randomIdCard = await getRandomCardId();
        const cardImage = await createCardImage(randomIdCard, fieldSide);

        document.getElementById(fieldSide).appendChild(cardImage);
    }
}

function playAudio (status){
    const audio = new Audio(`./src/assets/audios/${status}.mp3`);
}

async function playAudio(status) {
    const audio = new Audio();

    switch (status) {
        case "Você Ganhou :)":
            audio.src = `${pathAudios}win.wav`;
            break;
        case "Você Perdeu :(":
            audio.src = `${pathAudios}lose.wav`;
            break;
        default:
            return;
    }

    audio.volume = 0.3;
    try {
        await audio.play();
    } catch (e) {
        console.log("Erro ao tocar áudio (autoplay bloqueado):", e.message);
    }
}

async function playBackgroundMusic() {
    if (backgroundMusic) return; // Já está tocando

    backgroundMusic = new Audio(`${pathAudios}egyptian_duel.mp3`);
    backgroundMusic.volume = isMuted ? 0 : 0.1;
    backgroundMusic.loop = true;
    try {
        await backgroundMusic.play();
    } catch (e) {
        console.log("Erro ao tocar música de fundo (autoplay bloqueado):", e.message);
    }
}

async function toggleMute() {
    isMuted = !isMuted;

    if (backgroundMusic) {
        backgroundMusic.volume = isMuted ? 0 : 0.1;
    }

    // Atualizar texto do botão
    const muteBtn = document.getElementById("mute-btn");
    muteBtn.innerText = isMuted ? "🔇 " : "🔊 ";

    console.log(isMuted ? "Música mutada" : "Música ativada");
}

function init(){
    drawCards(5, playerSides.player1);
    drawCards(5, playerSides.computer);
}

init();