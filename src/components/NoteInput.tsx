import { TextInput } from 'react-native';
import { colors } from '../theme';

export function NoteInput({ value, onChangeText, placeholder }: { value?: string; onChangeText: (v: string) => void; placeholder: string }) {
  return (
    <TextInput
      multiline
      value={value ?? ''}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.meta}
      textAlignVertical="top"
      style={{ minHeight: 76, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: colors.text }}
    />
  );
}
