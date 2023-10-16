import { showCards, sitIn, sitOut, playerLeaveTable, sitOutNextHand, tableSettings, tableSubscribe, waitForBB, doChat, submitSideBet, acceptInsurance } from "../services/table-server";
import { disConnectSocket, playerLeave, updatePlayerInfo, autoFold, ShowTipToDealer, onShareHand } from "../socket-client";
import { toggleCheckbox } from "./checkbox";
import { getPlayerSeat, getCurrentTurn, turnAction, joinWaitingList } from '../services/table-server';
import { showBuyIn } from './game-ui';
import { userMode, userToken } from '../services/game-server';
import { getMoneyText } from "./money-display";
import { getPlayerCardHandGroup } from './card-ui';
import { shareHandHostAddress } from '../http-client';

const tableSettingSpanDiv = $(".tableSettingsSpan")[0];
const tableNameDiv = $(".tableName")[0];

const actionUIDiv = $("#turnActionsDiv")[0];
const automaticActionsDiv = $("#automaticActionsDiv")[0];
const autoCheckCheckbox = $("#autoCheckButton .checkbox")[0];
const autoCheckOrFoldCheckbox = $("#autoCheckOrFoldButton .checkbox")[0];
const autoFoldCheckboxes = $(".autoFoldButton .checkbox");
const autoFoldButtons = $(".autoFoldButton");
const waitForBBButtons = $(".waitForBBButton");
const waitForBBCheckboxes = $(".waitForBBButton .checkbox");
const sitOutNextHandButtons = $(".sitOutNextHandButton");
const sitOutNextHandCheckboxes = $(".sitOutNextHandButton .checkbox");
const smallBlindSpan = $(".smallBlind")[0];
const bigBlindSpan = $(".bigBlind")[0];
const anteSpan = $(".ante")[0];
const levelSpan = $(".level")[0];
const nextSbBb = $(".nextSBBB")[0];
const levelTimer = $(".tournamentOnly .timer")[0];
const breakCountdownDiv = $("#breakTime")[0];
const sitInBtn = $("#backButton")[0];
const showCardBtn = $("#showCardsButton")[0];
const menuBottomButtons = $(".menuBottomButtons button");
const addChipsButtons = $(".addChipsButton");
const addTipsButtons = $(".addTipsButton")[0];
const TipsOptions = $("#tip-button button");
const tipButtonDiv = $("#tip-button")[0]
const settingsButtons = $(".settingsButton");
const buyInMenu = $("#buyInMenu")[0];
const settingsMenu = $("#settingsMenu")[0];
const sitOutButtons = $(".sitOutButton");
const leaveButtons = $(".leaveButton");
const backLobbyButtons = $(".backLobbyButton");
const shareHand = $(".sharehand")[0];
const tournamentDivs = $(".tournamentOnly");
const meDiv = $("#meDiv")[0];
const tropyDivs = $(".trophyDiv");
const tropySpans = $(".trophyDiv span");
const openMenuButton = $("#openMenuButton")[0];
const mobileSideBar = $("#mobileSideBar")[0];
const handResultDiv = $(".handResult")[0];
const waitListDiv = $(".waitingList")[0];
const joinWaitingButton = $(".waitingList button")[0];
const waitListCount = $(".waitingListSide > div:first-of-type")[0];
const waitList = $(".users")[0];
const waitListDropdown = $("#usersDropdown")[0];
const waitListArrow = $("#arrow")[0]
const logDiv = $('.logTabButton .activInner .log_data')[0];
const chatDiv = $('.chatButton .activInner #divmessage .userMessage')[0];
const chatInput = $('.chatButton .input_div input')[0];
const chatSendIcon = $('.chatButton .input_div > i')[0];
const chatButton = $('.chatButton')[0];
const logButton = $('.logTabButton')[0];
const multiTableButtons = $(".multiTableButton");
const dropdownMenus = $(".dropdown-menu");
const chatButtons = $(".chatButtons");
const btnCloses = $(".btn-closes");
const CloseModal = $(".close, #GO");
const preChatMsgOrEmoji = $('.preChatEmoji,.preChatMsg');
const submitButton = $('#submit-sidebet')[0];
const tournamentTimers = $(".timers")[0];
const insuranceYesButton = $(".insuranceYesButton")[0];
const insuranceNextTime = $(".insuranceNextTime")[0];
const insurancePrice = $(".insurancePrice")[0];
const allInPrice = $(".allInPrice");
const autoFoldModeButtonDiv = $(".autoFoldModeButton")[0];
const autoFoldModeButtonCheckboxes = $(".autoFoldModeButton .checkbox")[0];

export class MainUI {
    constructor(buyInUI) {
        this.playerInfo = {
            name: "Guest",
            seat: 0
        };

        this.levelInfo = {
            level: 0,
            duration: 0,
            nextSB: 0,
            nextBB: 0,
            ante: 0
        };

        this.tableInfo = {
            name: "Table",
            mode: "cash",
            smallBlind: 0,
            bigBlind: 0
        };

        this.buyInUI = buyInUI;
        this.prevLevel = 0;
        this.breakDuration = 60;
        this.interval = undefined;
        this.tournamentTimeInterval = undefined;
        this.lvlInterval = undefined;
        this.optionFoldToAnyBet = false;
        this.optionActionAutoCheck = false;
        this.optionActionAutoCheckOrFold = false;
        this.isTurn = false;
        this.isPlaying = false;
        this.insuranceAmount = 0;
        this.insuranceWinAmount = 0;
        this.playerAutoFoldCards = [];
        // this.showAutoCheckOrFold = false;
        this.init();
    }

    init() {
        breakCountdownDiv.style.visibility = "hidden";
        this.setActive(automaticActionsDiv, false);
        this.setActive(autoFoldModeButtonDiv, false);
        this.setActiveElements(leaveButtons, false);
        this.setActiveElements(backLobbyButtons, true);
        this.setActive(sitInBtn, false);
        this.setActive(addTipsButtons, false);
        this.setActiveElements(tournamentDivs, false);
        this.setActive(tableNameDiv, false);
        this.setActive(tableSettingSpanDiv, false);
        this.setActive(meDiv, false);
        this.setActive($(meDiv).find(".stars")[0], false);
        this.setActive(handResultDiv, false);

        sitInBtn.addEventListener('click', () => {
            this.onSitInClick();
        });
        for (const button of sitOutButtons)
            button.addEventListener('click', () => { if (this.isTurn) this.onSitOutClick(); });
        showCardBtn.addEventListener('click', () => {
            this.onShowCardClick();
        });

        for (const tropyDiv of tropyDivs)
            this.setActive(tropyDiv, false);

        for (const button of leaveButtons)
            button.addEventListener('click', () => { playerLeaveTable(); });

        for (const button of backLobbyButtons)
            button.addEventListener('click', playerLeave);

        for (const button of CloseModal)
            button.addEventListener('click', () => {
                $('#shareHandMessage').modal('hide');
                $('#TipToDealer').modal('hide');
                $('#SubmitReport').modal('hide');
            });

        for (const button of dropdownMenus)
            button.addEventListener('click', (e) => { if (button.classList.contains("show")) { e.stopPropagation(); } });

        for (const button of btnCloses)
            button.addEventListener('click', (e) => { button.closest('.dropdown-menu').classList.remove("show"); });

        for (const button of chatButtons) {
            button.addEventListener('click', () => {

                $(".chatButtons").removeClass("active");
                $(".blocks").css("display", "none");
                $(".chatButtons").find('i').css("color", '#9499a6');
                button.querySelector('i').style.color = 'white';
                const div = button.getAttribute('data-divshow');
                document.querySelector("#" + div).style.display = "block";
                button.classList.add('active');
            });
        }

        for (const button of preChatMsgOrEmoji) {
            button.addEventListener('click', (e) => {
                doChat({ msg: e.target.innerText });
            });
        }

        for (const button of menuBottomButtons) {
            button.addEventListener('click', this.closeMenu);
        }

        for (const button of addChipsButtons) {
            button.addEventListener('click', () => {
                updatePlayerInfo(() => {
                    this.buyInUI.showBuyIn(true);
                    this.buyInUI.setBuyInPanelInfo(1);
                }, 100);
            });
        }

        for (const button of settingsButtons) {
            button.addEventListener('click', () => {
                this.setActive(settingsMenu, true);
            });
        }

        shareHand.addEventListener('click', () => {
            onShareHand(
                (encryptText) => {
                    if (encryptText !== "") {
                        navigator.clipboard.writeText(shareHandHostAddress + `/?token=` + encryptText);
                        $('#shareHandMessage').modal('show');
                    }
                }
            )
        })

        addTipsButtons.addEventListener('click', () => {
            this.setActive(tipButtonDiv, true);
        });

        for (const button of TipsOptions) {
            button.addEventListener('click', () => {
                const TipAmount = button.attributes['value'].value;
                this.setActive(tipButtonDiv, false);
                ShowTipToDealer(TipAmount, () => {
                    $('#TipToDealer').modal('show');
                });
            })
        }

        for (const waitForBBCheckbox of waitForBBCheckboxes) {
            toggleCheckbox(waitForBBCheckbox, true);
            waitForBBCheckbox.addEventListener('change', () => { waitForBB(waitForBBCheckbox.checked) });
        }
        for (const sitOutNextHandCheckbox of sitOutNextHandCheckboxes) {
            sitOutNextHandCheckbox.addEventListener('change', () => { sitOutNextHand(sitOutNextHandCheckbox.checked) });
        }

        for (const autoFoldCheckbox of autoFoldCheckboxes) {
            autoFoldCheckbox.addEventListener('change', () => {
                this.onOptionFoldToAnyBet(autoFoldCheckbox.checked);
            });
        }

        autoCheckCheckbox.addEventListener('change', () => {
            this.onOptionActionAutoCheck(autoCheckCheckbox.checked);
        });

        autoCheckOrFoldCheckbox.addEventListener('change', () => {
            this.onOptionActionAutoCheckOrFold(autoCheckOrFoldCheckbox.checked);
        });


        openMenuButton.addEventListener('click', () => {
            $(mobileSideBar).addClass("active");
        });

        autoFoldModeButtonCheckboxes.addEventListener('change', () => {
            if (autoFoldModeButtonCheckboxes.checked) {
                autoFold(autoFoldModeButtonCheckboxes.checked, (data) => {
                    data = JSON.parse(data);
                    if (data.status == true) {
                        this.playerAutoFoldCards = data.AutoFoldCards;
                        return true;
                    }
                });
            }
            this.playerAutoFoldCards = [];
        });

        mobileSideBar.addEventListener('click', () => {
            $(mobileSideBar).removeClass("active");
        });

        joinWaitingButton.addEventListener('click', () => {
            joinWaitingList();
        })

        waitListArrow.addEventListener('click', () => {
            if (waitListDropdown.style.display == 'none') {
                waitListDropdown.style.display = 'block';
            } else {
                waitListDropdown.style.display = 'none';
            }
        })

        chatInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter' || e.keyCode === 13) {
                console.log(e.target.value);
                doChat({ msg: e.target.value });
                e.target.value = "";
            }
        });

        chatSendIcon.addEventListener('click', () => {
            console.log(chatInput.value);
            if (chatInput.value) {
                doChat({ msg: chatInput.value });
                chatInput.value = "";
            }
        });

        for (const button of multiTableButtons) {
            button.addEventListener('click', () => { window.open("https://dev.nrpoker.net/frontUser/newhome", userToken); });
        }

        submitButton.addEventListener('click', () => {
            let sidebets = [];
            const elements = $('.btun');
            for (const button of elements) {
                if (button.classList.contains('selected')) {
                    sidebets.push(button.id)
                }
            }
            submitSideBet(sidebets);
        });

        insuranceYesButton.addEventListener('click', () => {
            acceptInsurance(this.insuranceAmount, this.insuranceWinAmount);
            $('#insuranceModal').modal('hide');
        });
        insuranceNextTime.addEventListener('click', () => {
            $('#insuranceModal').modal('hide');
        });
    }

    setTrophyInfo(position, number) {
        for (const tropySpan of tropySpans) {
            tropySpan.innerText = `${position}/${number}`;
        }
    }

    showTrophyInfo(value) {
        for (const tropyDiv of tropyDivs)
            this.setActive(tropyDiv, value);
    }

    showFoldToAnyBetCheckbox(value) {
        for (const autoFoldButton of autoFoldButtons) {
            this.setActive(autoFoldButton, value);
        }
    }

    onOptionFoldToAnyBet(value) {
        this.optionFoldToAnyBet = value;
        // this.showAutoCheckOptions(!value);
        // this.showAutoCheckOrFold = !value;
        this.doFoldToAnyBet();
    }

    showAutoCheckOptions(value) {
        if (value) {
            console.trace();
        }

        if (this.optionFoldToAnyBet) {
            this.setActive(automaticActionsDiv, false);
            return;
        }

        if (automaticActionsDiv.style.visibility == "visible" && value) {
            return;
        }

        this.setActive(automaticActionsDiv, value);
        this.resetAutoCheckOptions();
    }

    resetAutoCheckOptions() {
        toggleCheckbox(autoCheckCheckbox, false);
        this.onOptionActionAutoCheck(false);
        toggleCheckbox(autoCheckOrFoldCheckbox, false);
        this.onOptionActionAutoCheckOrFold(false);
    }

    onOptionActionAutoCheck(value) {
        this.optionActionAutoCheck = value;
        this.doAutoCheck();

        if (this.optionActionAutoCheck) {
            toggleCheckbox(autoCheckOrFoldCheckbox, false);
            this.onOptionActionAutoCheckOrFold(false);
        }
    }

    onOptionActionAutoCheckOrFold(value) {
        this.optionActionAutoCheckOrFold = value;
        this.doAutoCheckOrFold();

        if (this.optionActionAutoCheckOrFold) {
            toggleCheckbox(autoCheckCheckbox, false);
            this.onOptionActionAutoCheck(false);
        }
    }

    doFoldToAnyBet() {
        if (!this.optionFoldToAnyBet || getPlayerSeat() == -1 || getPlayerSeat() != getCurrentTurn().seat)
            return false;

        this.onFoldClick();
        return true;
    }

    doAutoFold() {

    }

    doAutoCheck() {
        if (!this.optionActionAutoCheck || getPlayerSeat() == -1 || getPlayerSeat() != getCurrentTurn().seat)
            return false;

        this.resetAutoCheckOptions();

        if (!getCurrentTurn().canCheck) {
            // this.setActive(automaticActionsDiv, false);
            return false;
        }

        // this.setActive(automaticActionsDiv, false);
        this.onBetClick(0);
        return true;
    }

    doAutoCheckOrFold() {
        if (!this.optionActionAutoCheckOrFold || getPlayerSeat() == -1 || getPlayerSeat() != getCurrentTurn().seat)
            return false;

        this.resetAutoCheckOptions();

        if (getCurrentTurn().canCheck) {
            this.onBetClick(0);
            // this.setActive(automaticActionsDiv, false);
        } else
            this.onFoldClick();
        return true;
    }

    onFoldClick() {
        turnAction("fold");
        this.setActive(actionUIDiv, false);
        this.setActive(automaticActionsDiv, false);
    }

    onBetClick(bet) {
        turnAction("bet", bet);
        this.setActive(actionUIDiv, false);
        this.setActive(automaticActionsDiv, false);
    }

    closeMenu() {
        const button = $(this);
        const div = button.closest('.menuDiv')[0];
        div.style.visibility = "hidden";
    }

    getTableMode() {
        return this.tableInfo.mode;
    }

    getPlayerSeat() {
        return this.playerInfo.seat;
    }

    setPlayerName(newPlayerInfo) {
        this.playerInfo.name = newPlayerInfo.name;
        $(meDiv).find("#myName")[0].innerText = this.playerInfo.name;
        this.setActive(meDiv, true);
    }

    setHandResult(value) {
        if (!value) {
            this.setActive(handResultDiv, false)
        } else {
            this.setActive(handResultDiv, true)
            handResultDiv.innerText = value;
        }
    }

    setLevelInfo(level, duration, nextSB, nextBB, ante, sb, bb) {

        if (level == this.prevLevel)
            return;

        this.levelInfo.level = level;
        this.levelInfo.duration = Math.floor(duration);
        this.levelInfo.nextSB = nextSB;
        this.levelInfo.nextBB = nextBB;
        this.levelInfo.ante = ante;

        if (level != undefined) {
            smallBlindSpan.innerText = getMoneyText(sb);
            bigBlindSpan.innerText = getMoneyText(bb);
            anteSpan.innerText = ante;
            levelSpan.innerText = level;
        }

        this.setActiveElements(tournamentDivs, true);
        this.setActive(tableSettingSpanDiv, true);
        if (nextBB != undefined && nextSB != undefined) {
            if (nextBB === 0 && nextSB === 0)
                nextSbBb.innerText = ``;
            else
                nextSbBb.innerText = `${nextSB} / ${nextBB}`;
        } else
            nextSbBb.innerText = ": Break"

        this.runLevelDurationTimer();

        this.prevLevel = level;
    }

    showLevel(value) {
        this.setActive(anteSpan, value);
        this.setActive(levelSpan, value);
        this.setActive(nextSbBb, value);
        this.setActive(levelTimer, value);
    }

    runLevelDurationTimer() {
        if (this.lvlInterval != undefined) return;
        this.lvlInterval = setInterval(() => {
            let hour = Math.floor(this.levelInfo.duration / 3600);
            let min = Math.floor((this.levelInfo.duration - hour * 60) / 60);
            let sec = this.levelInfo.duration - hour * 3600 - min * 60;
            levelTimer.innerText = hour + ":" + (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);

            if (this.levelInfo.duration === 0) {
                this.clearLevelDuration();
            }

            --this.levelInfo.duration;
        }, 1000);
    }

    clearLevelDuration() {
        clearInterval(this.lvlInterval);
        this.lvlInterval = undefined;
    }

    setTableName(name) {
        this.tableInfo.name = name;
        tableNameDiv.innerText = name;
        this.setActive(tableNameDiv, true);
    }

    setSmallBlind(smallBlind) {
        this.tableInfo.smallBlind = smallBlind;
        smallBlindSpan.innerText = getMoneyText(smallBlind);
        this.setActive(tableSettingSpanDiv, true);
    }

    setBigBlind(bigBlind) {
        this.tableInfo.bigBlind = bigBlind;
        bigBlindSpan.innerText = getMoneyText(bigBlind);
        this.setActive(tableSettingSpanDiv, true);
    }

    setShowDollarSign(value) {

    }

    showAddChips(value) {
        for (const button of addChipsButtons) {
            this.setActive(button, value);
        }
    }

    showSitIn(value) {
        this.setActive(sitInBtn, value);
    }

    setTurnFlag(value) {
        this.isTurn = value;
    }

    onSitInClick() {
        sitIn();
    }

    onSitOutClick() {
        sitOut();
    }

    onShowCardClick() {
        showCards();
        this.showShowCardsButton(false);
    }

    showShowCardsButton(value) {
        showCardBtn.style.visibility = value ? "visible" : "hidden";
    }

    showSitOut(value) {
        this.setActiveElements(sitOutButtons, value);
    }

    showWaitForBB(value) {
        this.setActiveElements(waitForBBButtons, value);
    }

    showAutoFold(value) {
        this.setActive(autoFoldModeButtonDiv, value);
    }

    setWaitForBB(value) {
        for (const waitForBBCheckbox of waitForBBCheckboxes) {
            toggleCheckbox(waitForBBCheckbox, value);
        }
    }

    setFoldAnyBet(value) {
        for (const autoFoldCheckbox of autoFoldCheckboxes) {
            toggleCheckbox(autoFoldCheckbox, value);
        }
    }

    showLeaveGameButton(value) {
        this.setActiveElements(leaveButtons, value);
    }
    showTipDealer(value) {
        this.setActive(addTipsButtons, value);
    }

    showBackLobbyButton(value) {
        this.setActiveElements(backLobbyButtons, value);
    }

    showSitOutNextHand(value) {
        this.setActiveElements(sitOutNextHandButtons, value);
    }

    setSitOutNextHand(value) {
        for (const sitOutNextHandCheckbox of sitOutNextHandCheckboxes)
            toggleCheckbox(sitOutNextHandCheckbox, value);
    }

    showBreakTime(isBreak, breakDuration) {
        if (this.prevLevel == 0) return;
        if (!isBreak && this.interval != undefined) { this.clearBreakTime(); return; }
        if (!isBreak || this.interval != undefined) return;

        this.breakDuration = breakDuration;
        breakCountdownDiv.style.visibility = "visible";
        breakCountdownDiv.style.display = "flex";
        $(breakCountdownDiv).find("div")[0].style.animationDuration = `${breakDuration}s`;
        $(breakCountdownDiv).find("div")[0].style.animationName = "progressAnimation";
        this.interval = setInterval(() => {
            let min = Math.floor(this.breakDuration / 60);
            let sec = this.breakDuration - min * 60;
            $(breakCountdownDiv).find(".timer")[0].textContent = (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);
            --this.breakDuration;
            if (this.breakDuration === 0) {
                this.clearBreakTime();
            }
        }, 1000);
    }

    clearBreakTime() {
        breakCountdownDiv.style.visibility = "hidden";
        breakCountdownDiv.style.display = "none";
        clearInterval(this.interval);
        this.breakDuration = 0;
        this.interval = undefined;
    }

    setActiveElements(elements, value) {
        for (const element of elements)
            element.style.visibility = (value == false || userMode === 1) ? "hidden" : "visible";
    }

    setActive(element, value) {
        element.style.visibility = (value == false || userMode === 1) ? "hidden" : "visible";
    }

    setWaitList(players) {
        this.setActive(joinWaitingButton, true);

        waitListCount.innerText = players.length;
        waitList.innerHTML = '';

        // const div = document.createElement('div');
        // div.innerText = 'user'
        // waitList.append(div);

        for (const player of players) {
            let userDiv;

            if (player === this.playerInfo.name) {
                userDiv = document.createElement('button');
                // joinWaitingButton.setAttribute('disabled', '');
            } else {
                userDiv = document.createElement('div');
                userDiv.className = "innerUser";
            }

            userDiv.innerHTML = player;

            waitList.append(userDiv);
        }
    }

    showWaitList(value) {
        if (value) {
            waitListDiv.style.display = 'flex';
        } else {
            waitListDiv.style.display = 'none';
        }
    }

    setPlayStatus(value) {
        this.isPlaying = value;

        this.showLogButton(value);
        this.showChatButton(value);
    }

    showLogButton(value) {
        logButton.style.visibility = value ? "visible" : "hidden";
    }

    showChatButton(value) {
        chatButton.style.visibility = value ? "visible" : "hidden";
    }

    addLog(text) {
        logDiv.innerHTML = logDiv.innerHTML + '<p class="firsr_but mt-2 px-2">' + text + '</p>';

        let x = $('.logTabButton .activities')[0];
        x.scrollTo(0, x.scrollHeight);
    }

    addChat(data) {
        var html = '<div class="third_p mt-2"><p class="tan mx-2">' + data.playerName + '</p><p class="he  ">' + data.msg + '</p></div>';
        chatDiv.innerHTML = chatDiv.innerHTML + html;

        let x = $('.chatButton .activities')[0];
        x.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "smooth" });
    }
    showTournamentTime(tournamentStartTime) {
        //tournamentStartTime = "2023-09-20 15:03:57";
        if (this.tournamentTimeInterval === undefined) {
            this.tournamentTimeInterval = setInterval(() => {
                var today = moment.tz(new Date(), 'Europe/Kiev').format('YYYY-MM-DD HH:mm:ss');
                if (Date.parse(tournamentStartTime) > Date.parse(today)) {
                    this.setActive(tournamentTimers, true);
                    var total = Date.parse(tournamentStartTime) - Date.parse(today);
                    var seconds = Math.floor((total / 1000) % 60);
                    var minutes = Math.floor((total / 1000 / 60) % 60);
                    tournamentTimers.querySelector('.minutes').innerText = ('0' + minutes).slice(-2);
                    tournamentTimers.querySelector('.seconds').innerText = ('0' + seconds).slice(-2);

                    console.log(`today:${today},seconds:${seconds},minutes:${minutes}`);
                } else {

                    if (this.tournamentTimeInterval !== undefined) {
                        this.setActive(tournamentTimers, false);
                        clearInterval(this.tournamentTimeInterval);
                        //    location.reload();
                    }

                }
            }, 1000);
        }


    }

    showInsurance(data) {
        if (data.status == true) {
            console.log(data);
            this.insuranceAmount = data.data.insurancePrice;
            this.insuranceWinAmount = data.data.allInPrice;

            insurancePrice.innerHTML = data.data.insurancePrice;
            for (const price of allInPrice)
                price.innerHTML = data.data.allInPrice;

            $('#insuranceModal').modal('show');
        } else {
            $('#insuranceModal').modal('hide');
            this.insuranceAmount = 0;
            this.insuranceWinAmount = 0;
        }

    }

    showMessage(msg, data = null) {
        if (data != null) {
            if (data.type == "RejoinInterval") {
                var Interval_time = Math.round(data.RestOfTime / 1000);
                let interval = undefined;

                if (Interval_time == 61) {
                    msg = "There is mandatory " + (Interval_time - 1) + " seconds delay if you want to rejoin this game";
                    $('.error-message')[0].innerHTML = msg;
                } else {
                    interval = setInterval(() => {
                        Interval_time--;
                        if (Interval_time > 0) {
                            msg = "There is mandatory " + Interval_time + " seconds delay if you want to rejoin this game";
                            $('.error-message')[0].innerHTML = msg;
                        } else {
                            $('#msgModal').modal('hide');
                        }
                    }, 1000);
                }

                $("#msgModal").on('hide.bs.modal', function() {
                    if (!!interval)
                        clearInterval(interval);
                    Interval_time = 1000;
                });
            }
        }

        $('.error-message')[0].innerHTML = msg;
        $('#msgModal').modal('show');
    }

    showDoubleLoginMsg(msg) {
        $('.error-message')[0].innerHTML = msg;
        $('#msgModal #myModalLabel')[0].innerText = "Message"
        $('#msgModal button')[1].innerText = "Close Browser"

        $('#msgModal').modal('show');

        $("#msgModal").on('hide.bs.modal', function() {
            disConnectSocket();
            window.close();
        });
    }

    showTournamentResult(hasWin, prize, rank) {
        if (!hasWin) {
            $('.tournament-prize')[0].style.visibility = 'hidden';
        }

        $('#tournamentRank')[0].innerText = rank;
        $('#tournamentPrize')[0].innerText = prize;

        $('#tournamentResultModal').modal('show');

        $("#tournamentResultModal").on('hide.bs.modal', function() {
            alert('The modal is about to be hidden.');
            window.close();
        });
    }

    updateSideBetOptions(street, options) {
        $(".scroll_prents").find('.fund_prent').remove();
        $('#submit-sidebet').find('#total-amount')[0].innerText = '0$';
        $('#total-payout')[0].innerText = '$0';
        $(".text-street")[0].innerText = street;

        let div = '';
        for (const option of options) {
            div = div + `<div class="fund_prent mb-1 mt-1">
                            <div class="fund3 ">
                                <div class="top_prent">
                                    <div class="Hitting_prents">
                                        <div class="side-bet">
                                            <p class="bet-name">${option.betName}</p>
                                            <p class="bet-ratio">1:${Number(option.ratio) - 1}</p>
                                        </div>
                                        <button class="button_bor"> <span class="text-white-pay">Payout:</span><span class="text-yellow">$<span id="payout">0</span></span></button>
                                    </div>
                                    <i class="bi bi-question-circle icon-question"
                                        data-bs-toggle="modal" data-bs-target="#staticBackdrop"></i>
                                </div>
                                <div class="main_right">
                                    <div class="">
                                        <button id="${option.betName}-${this.tableInfo.bigBlind * 10}" class="p-bule btun"><span class="btau_text">$${this.tableInfo.bigBlind * 10}</span></button>
                                    </div>
                                    <div class="">
                                        <button id="${option.betName}-${this.tableInfo.bigBlind * 20}" class="p-bule btun"><span class="btau_text">$${this.tableInfo.bigBlind * 20}</span></button>
                                    </div>
                                    <div class="">
                                        <button id="${option.betName}-${this.tableInfo.bigBlind * 50}" class="p-bule btun"><span class="btau_text">$${this.tableInfo.bigBlind * 50}</span></button>
                                    </div>
                                </div>
                            </div>
                        </div>`;
        }
        $(".scroll_prents").append(div);

        const elements = $('.btun');
        for (const button of elements) {
            button.addEventListener('click', (e) => {
                const parentNode = e.currentTarget.parentNode.parentNode.parentNode;
                const ratio = Number($(parentNode).find(".bet-ratio")[0].innerText.split(':')[1]);

                if (e.currentTarget.classList.contains('selected')) {
                    e.currentTarget.classList.remove("selected");
                    $(parentNode).find("#payout")[0].innerText = 0;
                } else {
                    e.currentTarget.classList.add("selected");
                    $(parentNode).find("#payout")[0].innerText = Number(e.currentTarget.id.split('-')[1]) * ratio;
                }

                let totalBet = 0;
                for (const otherButton of elements) {
                    if (otherButton.id !== e.currentTarget.id && (otherButton.id.split('-')[0] === e.currentTarget.id.split('-')[0])) {
                        otherButton.classList.remove("selected");
                    }

                    if (otherButton.classList.contains('selected')) {
                        totalBet = totalBet + Number(otherButton.id.split('-')[1]);
                    }
                }

                let totalPayout = 0;
                for (const payout of $(".text-yellow")) {
                    totalPayout = totalPayout + Number($(payout).find("#payout")[0].innerText);
                }

                $('#submit-sidebet').find('#total-amount')[0].innerText = totalBet + '$';
                $('#total-payout')[0].innerText = '$' + totalPayout;
            });
        }
    }
}