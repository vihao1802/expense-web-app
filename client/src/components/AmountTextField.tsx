import { useState, useEffect } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { NumericFormat } from "react-number-format";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

const MIN_AMOUNT = 1000;

interface AmountTextFieldProps {
  value?: string;
  onAmountChange?: (amount: number) => void;
  error?: boolean;
  label?: string;
}

const AmountTextField: React.FC<AmountTextFieldProps> = ({ 
  value = "", 
  onAmountChange, 
  error: externalError,
  label,
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isTouched, setIsTouched] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  
  // Update internal value when prop changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInternalValue(newValue);
    
    // Remove formatting to check the actual number
    const numericValue = parseFloat(newValue.replace(/\D/g, '')) || 0;
    
    // Show warning if amount is less than minimum (only after user has interacted)
    if (isTouched) {
      setShowWarning(numericValue < MIN_AMOUNT);
    }
    
    // Notify parent component about the change
    if (onAmountChange) {
      onAmountChange(numericValue);
    }
  };

  const handleBlur = () => {
    setIsTouched(true);
    const numericValue = parseFloat(internalValue.replace(/\D/g, '')) || 0;
    setShowWarning(numericValue < MIN_AMOUNT);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  return (
    <Stack mt={1} spacing={1}>
      <NumericFormat
        label={label}
        value={internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        customInput={TextField}
        thousandSeparator=","
        suffix=" ₫"
        placeholder="1.000 ₫"
        fullWidth
        variant="outlined"
        error={showWarning || externalError}
        InputProps={{
          sx: {
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: (showWarning || externalError) ? '#f44336' : '#f6339a',
              borderWidth: 2,
              borderRadius: 2,
            },
          },
        }}
      />
      {showWarning && (
        <Typography variant="caption" color="error">
          Số tiền tối thiểu là 1.000 ₫
        </Typography>
      )}
    </Stack>
  );
};

export default AmountTextField;
