import { Vibration } from "react-native";

export class VibrationModule {
    private active:boolean = false;
    goal : number = 100;

    private minIntensity: number = 100;
    private maxIntensity: number = 800;

    constructor() {}

    vibrate(bearing: number) {
        console.log(bearing);
        if (this.active) { return; }

        // flip sign to reverse direction to point
        bearing -= this.goal;

        if (bearing > 180) { bearing = bearing - 360; }

        let intensity = (this.maxIntensity - this.minIntensity) * (Math.abs(bearing) / 180) + this.minIntensity;

        this.active = true;
        Vibration.vibrate(intensity, false);
        
        // Enable function again after timeout
        setTimeout(() => {this.active = false}, intensity);
    }
}