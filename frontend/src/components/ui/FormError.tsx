interface Props {
  errors: string[];
}

export function FormError({ errors }: Props) {
  if (!errors || errors.length === 0) return null;

  return (
    <div role="alert" aria-live="assertive" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
      <strong className="block font-medium">Por favor corrija os seguintes erros:</strong>
      <ul className="mt-2 list-disc list-inside text-sm">
        {errors.map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </ul>
    </div>
  );
}
