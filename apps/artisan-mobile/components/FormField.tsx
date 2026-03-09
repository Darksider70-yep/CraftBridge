import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

interface FormFieldProps extends TextInputProps {
  label: string;
}

export default function FormField({ label, style, ...inputProps }: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        style={[styles.input, style]}
        placeholderTextColor="#8A7E70"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#352B1E",
    marginBottom: 6,
  },
  input: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D8CCBB",
    backgroundColor: "#FFFDF8",
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#1E1E1E",
  },
});
