export function ErrorBox({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="errors" role="alert">
      {errors.join(" ")}
    </p>
  );
}
