import { useState } from "react"
import { db } from "../db/db"

export function AddEventForm() {
  const [start, setStart] = useState<Date>(new Date(Date.now()))
  const [end, setEnd] = useState<Date>(new Date(Date.now()))
  const [isFree, setIsFree] = useState<boolean>(true)
  const [status, setStatus] = useState("")

  async function addFriend() {
    try {
      // Add the new friend!
      const id = await db.events.add({
        start: start,
        end: end,
        is_free: isFree,
        fk_user: 1
      })

      setStatus(`Friend ${start} - ${end} successfully added. Got id ${id}`)
      setStart(new Date(Date.now()))
      setEnd(new Date(Date.now()))
      setIsFree(true)
    } catch (error) {
      setStatus(`Failed to add ${start} - ${end}: ${error}`)
    }
  }

  return (
    <>
      <p>{status}</p>
      Start:
      <input
        type="datetime-local"
        value={start.toLocaleString()}
        onChange={(ev) => setStart(new Date(ev.target.value))}
      />
      End:
      <input
        type="datetime-local"
        value={end.toLocaleString()}
        onChange={(ev) => setEnd(new Date(ev.target.value))}
      />
      Is free:
      <input
        type="checkbox"
        value={isFree ? 1 : 0}
        onChange={(ev) => setIsFree(ev.target.value == "1")}
      />
      <button onClick={addFriend}>Add</button>
    </>
  )
}
