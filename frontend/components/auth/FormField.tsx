import { Field } from "formik";
import { Label } from "../ui/label";

const FormField = ({
  className,
  label,
  name,
  errors,
  touched,
  fieldProps,
  children,
}: any) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <Label htmlFor={name} className="text-md">{label}</Label>
      <Field
        className={`border rounded-sm py-1 px-3 mt-1 outline-none focus:border-neutral-500 ${
          errors && touched ? "border-red-600" : "border-neutral-300"
        }`}
        name={name}
        {...fieldProps}>
        {children}
      </Field>
      {errors && touched ? (
        <span className="text-red-600 mt-1">{errors}</span>
      ) : null}
    </div>
  );
};

export default FormField;
