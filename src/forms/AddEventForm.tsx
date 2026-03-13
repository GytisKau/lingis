import { useState } from "react"
import { db } from "../db/db"
import { IonButton, IonInput, IonItem } from "@ionic/react"

function formatDateTimeLocal(date: Date) {
  const d = new Date(date) // copy
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export function AddEventForm() {
  const [start, setStart] = useState<Date>(new Date())
  const [end, setEnd] = useState<Date>(new Date((Date.now() + (1*60*60*1000))))
  const [isFree, setIsFree] = useState<boolean>(true)
  const [status, setStatus] = useState("")

  async function addFriend() {
    try {
      const id = await db.events.add({
        start: start,
        end: end,
        is_free: isFree
      })

      setStatus(`Free Time ${start} - ${end} successfully added. Got id ${id}`)
      setStart(new Date())
      setEnd(new Date((Date.now() + (60*60*1000))))
      setIsFree(true)
    } catch (error) {
      setStatus(`Failed to add ${start} - ${end}: ${error}`)
    }
  }

  return (
    <>
      <p>{status}</p>
      <IonItem>
        <IonInput
          label="Start"
          labelPlacement="stacked"
          type="datetime-local"
          value={title}
          required
          onIonChange={(ev) => setStart(new Date(ev.detail.value ?? new Date()))}
        />
      </IonItem>
      Start:
      <IonInput
        type="datetime-local"
        value={formatDateTimeLocal(start)}
        onChange={(ev) => setStart(new Date(ev.detail.value ?? new Date()))}
      />
      End:
      <input
        type="datetime-local"
        value={formatDateTimeLocal(end)}
        onChange={(ev) => setEnd(new Date(ev.detail.value ?? new Date()))}
      />
      Is free:
      <input
        type="checkbox"
        checked={isFree}
        onChange={(ev) => setIsFree(ev.target.checked)}
      />
      <IonButton onClick={addFriend}>Add</IonButton>
    </>
  )
}
