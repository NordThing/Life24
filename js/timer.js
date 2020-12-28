const timer = {
    data: function () { 
        return {
            offset: null,
            clock: null,
            interval: null,
            state: "",
            countdownTime: '',
            watchId: null
        }
    },
    mounted: function() {
        initButton('playButton', this.start);
        initButton('pauseButton', this.pause);
        initButton('resetButton', this.reset);
    },
    unmounted: function() {
        clearInterval(this.interval)
    },
    computed: {
        hours: function() {
            const lapsed = this.clock;
            return Math.floor((lapsed / 1000 / 60 / 60)).toString().padStart(2,'0');
        },
        minutes: function() {
            const lapsed = this.clock;
            return Math.floor((lapsed / 1000 / 60) % 60).toString().padStart(2,'0');
        },
        seconds: function() {
            const lapsed = this.clock;
            return Math.floor((lapsed / 1000) % 60).toString().padStart(2,'0');
        }
    },
    methods: {
        start: function() {
            if (!this.interval) {
                if (this.isCountdownMode()) {
                    const [hrVal, minVal, secVal] = this.getDisplayedTime();
                    this.countdownTime = [hrVal, minVal, secVal];
                    if (this.isValidCountdownState(hrVal, minVal, secVal)) {
                        this.offset = this.getCountdownOffset(hrVal, minVal, secVal);
                        this.interval = setInterval(this.countdownUpdate, 1);
                    } else {
                        return;
                    }
                } else {
                    this.offset = Date.now();
                    this.interval = setInterval(this.timerUpdate, 1);
                }
                setPlayStyle();
                this.watchId = startLocationRecording();
                this.state = "started";
            }
        },
        pause: function() {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
                setPauseStyle();
                this.state = "paused";
            }
        },
        reset: function() {
            showSaveDialog(this.getDisplayedTime());
            clearInterval(this.interval);
            this.interval = null;
            setResetStyle();
            this.clock = 0;
            if (this.watchId !== null) {
                navigator.geolocation.clearWatch(this.watchId);
            }
            this.state = "stopped";
        },
        timerUpdate: function() {
            const now = Date.now();
            const d = now - this.offset;
            this.offset = now;
            this.clock += d;
        },
        countdownUpdate: function() {
            const now = new Date().getTime();
            const diff = this.offset - now;
            if (diff > 0) {
                this.clock = diff;
            } else {
                showSaveDialog(this.countdownTime);
                this.reset();
            }
        },
        getCountdownOffset: function(hrs, min, sec) {
            const now = new Date().getTime();
            const h = parseInt(hrs, 10);
            const m = parseInt(min, 10);
            const s = parseInt(sec, 10);
            const ms = ((h*60*60+m*60+s)*1000);
            return now + ms;
        },
        getDisplayedTime: function() {
            const hrVal = hoursEl.innerHTML;
            const minVal = minutesEl.innerHTML;
            const secVal = secondsEl.innerHTML;
            return [hrVal, minVal, secVal];
        },
        onEdit: function(evt) {
            const text = evt.target.innerHTML;
            if (!this.isNumeric(text)) {
                evt.target.innerHTML = '00';
            } else if (!this.hasStarted()) {
                this.start();
            }
        },
        isNumeric: function(str) {
            if (typeof str != "string") return false
            return (str.length < 3 && str.length > 0) && (!isNaN(str) && !isNaN(parseFloat(str)));
        },
        hasStarted: function() {
            return this.state === "started" || this.state === "paused";
        },
        isCountdownMode: function() {
            const [hrVal, minVal, secVal] = this.getDisplayedTime();
            return (!this.hasStarted() || this.countdownTime.length > 0)
                && (hrVal !== "00" || minVal !== "00" || secVal !== "00");
        },
        isValidCountdownState: function(hrVal, minVal, secVal) {
            let isValid = true;
            if (!this.isNumeric(hrVal)) {
                hoursEl.innerHTML = '00';
                isValid = false;
            }
            if (!this.isNumeric(minVal)) {
                minutesEl.innerHTML = '00';
                isValid = false;
            }
            if (!this.isNumeric(secVal)) {
                secondsEl.innerHTML = '00';
                isValid = false;
            }
            return isValid;
        },
        getTimeContent: function(field) {
            const value = this[field];
            const editable = !this.hasStarted() ? 'true' : 'false';
            return '<span id="'+field+'El" contenteditable="'+editable+'" class="time">'+value+'</span>';
        }
    },
    template: `
            <div class="row">
                <div class="column">
                    <div class="circle">
                        <div @keydown.enter="onEdit" v-html="getTimeContent('hours')"/>
                        <span class="time">:</span>
                        <div @keydown.enter="onEdit" v-html="getTimeContent('minutes')"/>
                        <span class="time">:</span>
                        <div @keydown.enter="onEdit" v-html="getTimeContent('seconds')"/>
                    </div>
                </div>    
            </div>
   `,
};

function startLocationRecording() {
    let watchId = null;
    if(navigator.geolocation) {
        const options = {
            maximumAge: 1000,
            timeout: 5000,
            enableHighAccuracy : true,
        };
        const onSuccess = (position) => {
            let locationData = sessionStorage.getItem('location');
            if (locationData) {
                locationData = JSON.parse(locationData);
            } else {
                locationData = [];
            }
            locationData.push([position.coords.latitude, position.coords.longitude]);
            sessionStorage.setItem('location', JSON.stringify(locationData));
            sessionStorage.setItem('distance', getDistanceFromCoords(locationData));
        };
        const onError = (error) => {
            console.log(`Location error occured due to error code: ${error.code}`);
        }
        watchId = navigator.geolocation.watchPosition(onSuccess, onError, options);
    }
    return watchId;
}

const initButton = (id, handler) => {
    var el = document.getElementById(id);
    if (el) {
        el.addEventListener("click", function(event) {
            handler();
            event.preventDefault();
        });
    }
};
const getDistanceFromCoords = (coords) => {
    let distance = "";
    if (coords.length > 1) {
        const options = { units: 'kilometers' };
        let d = 0;
        const nrOfCoords = coords.length;
        for(let i = 0; i < nrOfCoords - 1; i++) {
            d += turf.distance(coords[i], coords[i+1], options);
        }
        distance = `${d} km`;
        console.log("You travelled: " + distance);
    }
    return distance;
}
const setPlayStyle = () => {
    playButton.style.display = "none";
    pauseButton.style.display = "unset";
    resetButton.style.display ="none";
    fab2.style.display = "none";
}
const setPauseStyle = () => {
    playButton.style.display = "unset";
    resetButton.style.display = "unset";
    pauseButton.style.display = "none";
    fab2.style.display = "unset";
}
const setResetStyle = () => {
    playButton.style.display = "unset";
    pauseButton.style.display = "none";
    resetButton.style.display = "none";
    fab2.style.display ="none";
}
const showSaveDialog = (result) => {
    const timeToSave = result.join(':');
    if (timeToSave !== '00:00:00') {
        const mainCont = document.getElementById("main");
        const modal = document.getElementById("saveModal");
        modal.setAttribute("result", timeToSave);
        mainCont.classList.add("main-blur");
        if (modal) {
            modal.style.display = "block";
        }
    }
}

export {
    timer
}