export function formatDuration(seconds: number ): string {
    if(seconds < 60){
        return `${seconds} s`
    }
    const hours = Math.floor(seconds/3600);
    const minutes = Math.floor((seconds % 3600)/60);
    const remaningSeconds = seconds % 60;

    if (hours > 0){
        if(remaningSeconds> 0){
            return `${hours}h ${minutes}m ${remaningSeconds}s`
        } else if (minutes > 0){
            return `${hours}h ${minutes}m`
        }else{
            return `${hours}h `
        }
    } else {
        if(remaningSeconds >0){
            return `${minutes}m ${remaningSeconds}s`
        } else {
            return `${minutes}m ${remaningSeconds}s`
        }
    }
}