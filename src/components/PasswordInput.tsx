import { useState } from 'react';
import {
  InputChangeEventDetail,
  IonInput,
  IonInputPasswordToggle
} from '@ionic/react';
import { IonInputCustomEvent } from '@ionic/core';

interface PasswordInputProps {
  label?: string;
  onValidate?: (
    value: string,
    checks?: PasswordChecks
  ) => void;
  validate?: boolean
}

export interface PasswordChecks {
  lowercase: boolean;
  uppercase: boolean;
  number: boolean;
  symbol: boolean;
  length: boolean;
}

export function ChecksValid(checks?: PasswordChecks){
  if(checks != undefined)
    return Object.values(checks).every(Boolean);
  return undefined
}

function PasswordInput({ label, onValidate, validate }: PasswordInputProps) {
  const [isTouched, setIsTouched] = useState(false);
  const [password, setPassword] = useState<string>("");
  const [checks, setChecks] = useState<PasswordChecks>();

  const handleInput = (event: IonInputCustomEvent<InputChangeEventDetail>) => {
    isTouched && validateInput(event.detail.value ?? undefined)
  }


  const validateInput = (input? : string) => {
    const value = input ?? "";

    setPassword(value);

    const localChecks = value.length > 0 && validate == true ? {
      lowercase: /[a-ząčęėįšųū]/.test(value),
      uppercase: /[A-ZĄČĘĖĮŠŲŪ]/.test(value),
      number: /[0-9]/.test(value),
      symbol: /[\^\$\*\.\[\]\{\}\(\)\?\"\!\@\#\%\&\/\\\,\>\<\'\:\;\|\_\~]/.test(value),
      length: value.length >= 6,
    } : undefined;

    setChecks(localChecks);
    onValidate?.(value, localChecks)
    return;
  };

  const handleBlur = (event: IonInputCustomEvent<FocusEvent>) => {
    setIsTouched(true);
    validateInput(event.target.value as string ?? undefined)
  };

  return (
    <>
      <IonInput
        className={`${ChecksValid(checks) === false ? 'ion-invalid' : ''} ${isTouched && 'ion-touched'}`}
        debounce={200}
        type="password"
        fill="outline"
        label={label ?? "Password"}
        labelPlacement="floating"
        helperText={password.length === 0 ? "Enter your password" : ""}
        errorText='Invalid password'
        onIonInput={handleInput}
        onIonBlur={handleBlur}
        clearOnEdit={false}
      >
        <IonInputPasswordToggle slot="end" />
      </IonInput>
    </>
  );
}

export default PasswordInput;