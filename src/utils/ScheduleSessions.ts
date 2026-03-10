import { Event, Session } from "../db/db"

function ScheduleSessions(freeTimeEvents: Event[], timeForAssignment: number, timeForSession: number, timeforBreak: number) {
    // timeforsession - 25 min, time for break - 5 min
    // timeForAssignment - 2 h -- 120 min

    const fullSessionTime = timeForSession + timeforBreak;

    const totalFreeTime = freeTimeEvents
        .map((event) => {
            const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60);
            console.log(`Duration: ${duration}`);
            return duration;
        })
        .reduce((prev, curr) => prev + curr, 0);
    
    var sessions: Session[] = [];

    console.log(`Total free time available: ${totalFreeTime} minutes. Time needed for assignment: ${timeForAssignment} minutes.`);
        // skaiciuoti kiek liko laiko is timeforassignment, vadinas timeleft
        // var assignmentTimeLeft = timeForAssignment;
        var numberOfTotalSessions = Math.ceil(timeForAssignment / timeForSession);
        var sessionsLeft = numberOfTotalSessions;
        
        console.log(`Enough free time available. Scheduling sessions...`);
        for (var freeTimeEvent of freeTimeEvents) {
            var duration = (freeTimeEvent.end.getTime() - freeTimeEvent.start.getTime()) / (1000 * 60);
            var sessionsInFreeTimeEvent = Math.floor(duration / fullSessionTime); // kiek sesiju tilps i free time eventa
            
            if (sessionsInFreeTimeEvent * fullSessionTime + timeForSession <= duration) {
                sessionsInFreeTimeEvent += 1; // jei tilps dar viena sesija, pridedam
            }

            console.log(`Free time event from ${freeTimeEvent.start.toLocaleString()} to ${freeTimeEvent.end.toLocaleString()} has duration ${duration} minutes, can fit ${sessionsInFreeTimeEvent} sessions.`);

            for (var i = 0; i < sessionsInFreeTimeEvent; i++) {
                const sessionStart = new Date(freeTimeEvent.start.getTime() + i * fullSessionTime * 60 * 1000);
                const sessionEnd = new Date(sessionStart.getTime() + timeForSession * 60 * 1000);

                // assignmentTimeLeft -= sessionsInFreeTimeEvent * timeForSession;
                sessions.push({start: sessionStart, end: sessionEnd});
                sessionsLeft--;
                if (sessionsLeft <= 0) { break; }
            }
            
        }
        console.log(`Scheduled ${sessions.length} sessions.`);
    

    return sessions;

}

export default ScheduleSessions;