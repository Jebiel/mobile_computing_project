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
    private pauseBetweenPatterns: number = 10000;
    private shortVibration: number = 150;
    private longVibration: number = 500;

    //Better to replace with associative array like forward: [], backward: []....
    private vibrationPatterns: number[][] = [
        [0, this.shortVibration, this.pauseInPattern, this.shortVibration], //forward
        [0, this.shortVibration, this.pauseInPattern, this.shortVibration, this.pauseInPattern, this.shortVibration], //backward
        [0, this.longVibration, this.pauseInPattern, this.shortVibration], //left
        [0, this.shortVibration, this.pauseInPattern, this.longVibration] //right
    ]

    constructor() { }

    // vibrate(actualHeading: number, desiredHeading: number, mode?: vibrateMode) {
    //     if (actualHeading < -180 || actualHeading > 360) {
    //         throw new Error('Wrong input given in vibrate function');
    //     }

    //     if (this.active) { return; }

    //     // Convert bearing to be in range -180 -> +180
    //     if (actualHeading > 180) { actualHeading = actualHeading - 360; }

    //     switch (mode) {
    //         case vibrateMode.LEFT:
    //             break;
    //         case vibrateMode.RIGHT:
    //             break;
    //         case vibrateMode.FORWARD:
    //             break;
    //         case vibrateMode.FORWARD_LEFT:
    //             break;
    //         case vibrateMode.FORWARD_RIGHT:
    //             break;
    //         case vibrateMode.BACKWARD:
    //             break;
    //         case vibrateMode.BACKWARD_LEFT:
    //             break;
    //         case vibrateMode.BACKWARD_RIGHT:
    //             break;
    //         default:
    //             // normalize formula: (b-a) * [(x-y) / (z-y)] + a
    //             // normalizes z in range y to z, to be in range a to b
    //             let intensity = (this.maxIntensity - this.minIntensity) * (Math.abs(bearing) / 180) + this.minIntensity;
    //             this.active = true;
    //             Vibration.vibrate(intensity, false);
    //             // Enable function again after timeout
    //             this.setTimeout(intensity);
    //     }
    // }

    vibrate(heading: number) {
        if (heading < -360 || heading > 360) {
            throw new Error('Wrong input given in vibrate function');
        }

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
        // console.log("Vibrate forward");
        //Pause, vibration, pause, vibration
        Vibration.vibrate(this.vibrationPatterns[0], false);
        // Enable function again after timeout
        this.setTimeout(this.vibrationPatterns[0].reduce((a, b) => a + b, 0));
    }

    vibrateBackward() {
        if (this.active) { return; }
        this.active = true;
        // console.log("Vibrate backward");
        Vibration.vibrate(this.vibrationPatterns[1], false);
        this.setTimeout(this.vibrationPatterns[1].reduce((a, b) => a + b, 0));
    }

    vibrateLeft() {
        if (this.active) { return; }
        this.active = true;
        // console.log("Vibrate left");
        Vibration.vibrate(this.vibrationPatterns[2], false);
        this.setTimeout(this.vibrationPatterns[2].reduce((a, b) => a + b, 0));
    }

    vibrateRigth() {
        if (this.active) { return; }
        this.active = true;
        // console.log("Vibrate right");
        Vibration.vibrate(this.vibrationPatterns[3], false);
        this.setTimeout(this.vibrationPatterns[3].reduce((a, b) => a + b, 0));
    }

    private setTimeout(time: number) {
        setTimeout(() => { this.active = false }, time);
    }

    private setPatternTimeout(time: number) {
        setTimeout(() => { this.patternPause = false }, time);
    }
}