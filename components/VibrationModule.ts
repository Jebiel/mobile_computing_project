import { Vibration } from "react-native";

enum VibrationMode {
    LEFT,
    RIGHT,
    FORWARD,
    BACKWARD
}

export class VibrationModule {
    //Used for pause for length of vibration
    private active: boolean = false;
    //Used for pause between patterns
    private patternPause: boolean = false;

    private minIntensity: number = 100;
    private maxIntensity: number = 800;

    private pauseInPattern: number = 300;
    //Will not be changed. Used as reference to set pauseBetweenPatterns value back after exiting near maneuver mode
    private pauseBetweenPatternsInitialValue: number = 15000;
    //Changes near maneuver
    private pauseBetweenPatterns: number = this.pauseBetweenPatternsInitialValue;

    //Near maneuver specific values
    private pauseBetweenPatternsNearManeuver: number = 3000;
    private nearManeuverModeDuration: number = this.pauseBetweenPatternsNearManeuver * 3;

    //Vibration type durations
    private shortVibration: number = 150;
    private longVibration: number = 500;

    //References to setTimeout loops. Needs in near maneuver mode
    private vibrationTimeoutRef = null;
    private patternTimeoutRef = null;

    //Change to true for demo
    private debugMode: boolean = true;

    //Better to replace with associative array like forward: [], backward: []....
    private vibrationPatterns: number[][] = [
        [0, this.shortVibration, this.pauseInPattern, this.shortVibration], //forward
        [0, this.shortVibration, this.pauseInPattern, this.shortVibration, this.pauseInPattern, this.shortVibration], //backward
        [0, this.longVibration, this.pauseInPattern, this.shortVibration], //left
        [0, this.shortVibration, this.pauseInPattern, this.longVibration] //right
    ]

    constructor() { }

    vibrate(heading: number) {
        if (heading < -360 || heading > 360) {
            throw new Error('Wrong input given in vibrate function');
        }

        //normalize formula: (b-a) * [(x-y) / (z-y)] + a
        //normalizes z in range y to z, to be in range a to b
        //let intensity = (this.maxIntensity - this.minIntensity) * (Math.abs(bearing) / 180) + this.minIntensity

        // Convert bearing to be in range -180 -> +180
        if (heading < -180) {
            heading = heading + 360;
        } else if (heading > 180) {
            heading = heading - 360;
        }

        // console.log("Heading: ");
        // console.log(heading);

        if (this.active || this.patternPause) { return; }

        let mode: VibrationMode = this.modeFromHeading(heading);
        this.vibratePattern(mode);
        this.setPatternTimeout(this.pauseBetweenPatterns);
    }

    vibratePattern(mode: VibrationMode) {
        if (this.patternPause) { return; }
        this.patternPause = true;
        // console.log("Pause: ")
        // console.log(this.pauseBetweenPatterns)
        switch (mode) {
            case VibrationMode.FORWARD:
                this.vibrateForward();
                break;
            case VibrationMode.LEFT:
                this.vibrateLeft();
                break;
            case VibrationMode.RIGHT:
                this.vibrateRigth();
                break;
            default:
                this.vibrateBackward();
                break;
        }
    }

    modeFromHeading(heading: number) {
        //Forward
        if (Math.abs(heading) < 45) {
            return VibrationMode.FORWARD;
        }
        //Left
        else if (heading > 45 && heading < 135) {
            return VibrationMode.LEFT;
        }
        //Right
        else if (heading < -45 && heading > -135) {
            return VibrationMode.RIGHT;
        }
        //Backward
        else {
            return VibrationMode.BACKWARD;
        }
    }

    vibrateForward() {
        if (this.active) { return; }
        this.active = true;
        if (this.debugMode) {
            console.log("Vibrate forward");
        }
        //Pause, vibration, pause, vibration
        Vibration.vibrate(this.vibrationPatterns[0], false);
        // Enable function again after timeout
        this.setTimeout(this.vibrationPatterns[0].reduce((a, b) => a + b, 0));
    }

    vibrateBackward() {
        if (this.active) { return; }
        this.active = true;
        if (this.debugMode) {
            console.log("Vibrate backward");
        }
        Vibration.vibrate(this.vibrationPatterns[1], false);
        this.setTimeout(this.vibrationPatterns[1].reduce((a, b) => a + b, 0));
    }

    vibrateLeft() {
        if (this.active) { return; }
        this.active = true;
        if (this.debugMode) {
            console.log("Vibrate left");
        }
        Vibration.vibrate(this.vibrationPatterns[2], false);
        this.setTimeout(this.vibrationPatterns[2].reduce((a, b) => a + b, 0));
    }

    vibrateRigth() {
        if (this.active) { return; }
        this.active = true;
        if (this.debugMode) {
            console.log("Vibrate right");
        }
        Vibration.vibrate(this.vibrationPatterns[3], false);
        this.setTimeout(this.vibrationPatterns[3].reduce((a, b) => a + b, 0));
    }

    private setTimeout(time: number) {
        //Stop previously started timeout if there is one
        if (this.vibrationTimeoutRef != null) {
            clearTimeout(this.vibrationTimeoutRef);
        }
        this.vibrationTimeoutRef = setTimeout(() => { this.active = false }, time);
    }

    private setPatternTimeout(time: number) {
        //Stop previously started timeout if there is one
        if (this.patternTimeoutRef != null) {
            clearTimeout(this.patternTimeoutRef);
        }
        this.patternTimeoutRef = setTimeout(() => { this.patternPause = false }, time);
    }

    decreasePatternPauseForWhile() {
        if (this.debugMode) {
            console.log("Near maneuver mode enabled");
        }
        this.pauseBetweenPatterns = this.pauseBetweenPatternsNearManeuver;
        if (this.patternTimeoutRef != null) {
            clearTimeout(this.patternTimeoutRef);
        }
        if (this.vibrationTimeoutRef != null) {
            clearTimeout(this.vibrationTimeoutRef);
        }
        this.active = false;
        this.patternPause = false;

        setTimeout(() => {
            if (this.debugMode) {
                console.log("Near maneuver mode disabled");
            }
            this.pauseBetweenPatterns = this.pauseBetweenPatternsInitialValue;
        }, this.nearManeuverModeDuration);
    }
}