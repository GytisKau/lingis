import { useState } from 'react';
import { InputChangeEventDetail, IonInput } from '@ionic/react';
import { IonInputCustomEvent } from '@ionic/core';

interface EmailInputProps {
  onIonInput?: (event: IonInputCustomEvent<InputChangeEventDetail>, isValid?: boolean) => void;
}

function EmailInput({onIonInput}: EmailInputProps) {
  const [isTouched, setIsTouched] = useState(false);
  const [isValid, setIsValid] = useState<boolean>();
  const [email, setEmail] = useState<string>("");

  const validateEmail = (email: string) => {
    return email.match(
      /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    );
  };

  const validate = (event: IonInputCustomEvent<InputChangeEventDetail>) => {
    const value = event.detail.value ?? ""
    setEmail(value)

    setIsValid(undefined);

    if (value === ''){
      if (onIonInput) onIonInput(event, isValid)
      return;
    }

    const valid = validateEmail(value) !== null
    setIsValid(valid)
    if (onIonInput) onIonInput(event, valid)
  };

  const markTouched = () => {
    setIsTouched(true);
  };

  return (
    <IonInput
      className={`${(isValid === false) && 'ion-invalid'} ${isTouched && 'ion-touched'}`}
      debounce={100}
      type="email"
      fill="outline"
      label="Email"
      labelPlacement="floating"
      inputMode='email'
      pattern='email'
      helperText={email.length == 0 ? "Enter a valid email" : ""}
      errorText={"Invalid email"}
      onIonInput={(event) => validate(event)}
      onIonBlur={() => markTouched()}
    ></IonInput>
  );
}
export default EmailInput;