export const TimerDisplay = ({ time }: { time: number }) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <h1 className="timer">
      {String(minutes).padStart(2, '0')}:
      {String(seconds).padStart(2, '0')}
    </h1>
  );
};