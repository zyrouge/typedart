export class DurationUtils {
    static prettySeconds(secs: number) {
        return `${Math.floor((secs / 60) % 60)}:${Math.floor(secs % 60)
            .toString()
            .padStart(2, "0")}`;
    }
}
