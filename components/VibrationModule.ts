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

    private setTimeout(time: number) {
        setTimeout(() => { this.active = false }, time);
    }
}