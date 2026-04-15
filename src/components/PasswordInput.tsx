import { useState } from 'react';
import { InputChangeEventDetail, IonInput } from '@ionic/react';
import { IonInputCustomEvent } from '@ionic/core';

interface PasswordInputProps {
  label?: string
  onIonInput?: (event: IonInputCustomEvent<InputChangeEventDetail>, isValid?: boolean) => void;
}

function PasswordInput({label, onIonInput}: PasswordInputProps) {
  const [isTouched, setIsTouched] = useState(false);
  const [password, setPassword] = useState<string>("");


  const markTouched = () => {
    setIsTouched(true);
  };

  return (
    <IonInput
      className={`${isTouched && 'ion-touched'}`}
      debounce={100}
      type="password"
      fill="outline"
      label={label ?? "Password"}
      labelPlacement="floating"
      helperText={password.length == 0 ? "Enter your password" : ""}
      onIonInput={(event) => {
        setPassword(event.detail.value ?? "")
        if(onIonInput) onIonInput(event, true)
      }}
      onIonBlur={() => markTouched()}
    ></IonInput>
  );
}
export default PasswordInput;