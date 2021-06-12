import { Vibration } from "react-native";

enum vibrateMode {
    LEFT,
    RIGHT,
    FORWARD,
    BACKWARD,
    FORWARD_LEFT,
    FORWARD_RIGHT,
    BACKWARD_LEFT,
    BACKWARD_RIGHT
}

export class VibrationModule {
    private active: boolean = false;

    private minIntensity: number = 100;
    private maxIntensity: number = 800;

    private pauseInPattern: number = 300;
    private shortVibration: number = 150;
    private longVibration: number = 500;

    //Better to replace with associative array like forward: [], backward: []....
    private vibrationPatterns: number [][]  = [
        [0, this.shortVibration, this.pauseInPattern, this.shortVibration], //forward
        [0, this.shortVibration, this.pauseInPattern, this.shortVibration, this.pauseInPattern, this.shortVibration], //backward
        [0, this.longVibration, this.pauseInPattern, this.shortVibration], //left
        [0, this.shortVibration, this.pauseInPattern, this.longVibration] //right
    ]

    constructor() { }

    vibrate(actualHeading: number, desiredHeading: number, mode?: vibrateMode) {
        if (actualHeading < -180 || actualHeading > 360) {
            throw new Error('Wrong input given in vibrate function');
        }

        if (this.active) { return; }

        // Convert bearing to be in range -180 -> +180
        if (actualHeading > 180) { actualHeading = actualHeading - 360; }

        switch (mode) {
            case vibrateMode.LEFT:
                break;
            case vibrateMode.RIGHT:
                break;
            case vibrateMode.FORWARD:
                break;
            case vibrateMode.FORWARD_LEFT:
                break;
            case vibrateMode.FORWARD_RIGHT:
                break;
            case vibrateMode.BACKWARD:
                break;
            case vibrateMode.BACKWARD_LEFT:
                break;
            case vibrateMode.BACKWARD_RIGHT:
                break;
            default:
                // normalize formula: (b-a) * [(x-y) / (z-y)] + a
                // normalizes z in range y to z, to be in range a to b
                let intensity = (this.maxIntensity - this.minIntensity) * (Math.abs(bearing) / 180) + this.minIntensity;
                this.active = true;
                Vibration.vibrate(intensity, false);
                // Enable function again after timeout
                this.setTimeout(intensity);
        }
    }

    vibrateForward() {
        if (this.active) { return; }
        //Pause, vibration, pause, vibration
        Vibration.vibrate(this.vibrationPatterns[0], false);
        // Enable function again after timeout
        this.setTimeout(this.vibrationPatterns[0].reduce((a, b) => a + b, 0));
    }

    vibrateBackward() {
        if (this.active) { return; }
        Vibration.vibrate(this.vibrationPatterns[1], false);
        this.setTimeout(this.vibrationPatterns[1].reduce((a, b) => a + b, 0));
    }

    vibrateLeft() {
        if (this.active) { return; }
        Vibration.vibrate(this.vibrationPatterns[2], false);
        this.setTimeout(this.vibrationPatterns[2].reduce((a, b) => a + b, 0));
    }

    vibrateRigth() {
        if (this.active) { return; }
        Vibration.vibrate(this.vibrationPatterns[3], false);
        this.setTimeout(this.vibrationPatterns[3].reduce((a, b) => a + b, 0));
    }

    private setTimeout(time: number) {
        setTimeout(() => { this.active = false }, time);
    }
}