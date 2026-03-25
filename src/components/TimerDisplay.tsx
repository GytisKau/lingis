interface TimerDisplayProps {
  minutes: number
  seconds?: number
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ minutes, seconds = 0 }) => {
  return (
    <h1 className="timer">
      {String(minutes).padStart(2, "0")}:
      {String(seconds).padStart(2, "0")}
    </h1>
  )
}

export default TimerDisplay