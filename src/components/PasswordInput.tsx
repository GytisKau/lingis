import { useState } from 'react';
import { InputChangeEventDetail, IonInput, IonInputPasswordToggle } from '@ionic/react';
import { IonInputCustomEvent } from '@ionic/core';

interface PasswordInputProps {
  label?: string
  onIonInput?: (event: IonInputCustomEvent<InputChangeEventDetail>, isValid?: boolean) => void;
}

function PasswordInput({label, onIonInput}: PasswordInputProps) {
  const [isTouched, setIsTouched] = useState(false);
  const [isValid, setIsValid] = useState<boolean>();
  const [password, setPassword] = useState<string>("");

  const validate = (event: IonInputCustomEvent<InputChangeEventDetail>) => {
    const value = event.detail.value ?? ""
    setPassword(value)

    setIsValid(undefined);

    if (value === ''){
      if (onIonInput) onIonInput(event, isValid)
      return;
    }

    setIsValid(value.length >= 6)
    if (onIonInput) onIonInput(event, value.length >= 6)
  };

  const markTouched = () => {
    setIsTouched(true);
  };

  return (
    <IonInput
      className={`${(isValid === false) && 'ion-invalid'} ${isTouched && 'ion-touched'}`}
      debounce={100}
      type="password"
      fill="outline"
      label={label ?? "Password"}
      labelPlacement="floating"
      errorText={"Minimum 6 characters"}
      helperText={password.length == 0 ? "Enter your password" : ""}
      onIonInput={(event) => validate(event)}
      onIonBlur={() => markTouched()}
    >
      <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
    </IonInput>
  );
}
export default PasswordInput;