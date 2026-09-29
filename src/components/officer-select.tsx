import * as Select from "@radix-ui/react-select";

export function OfficerSelect({
  officers,
  value,
  onChange,
}: {
  officers: { id: string; name: string; count: number }[];
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  return (
    <Select.Root
      value={value ?? "all"}
      onValueChange={(next) => onChange(next === "all" ? null : next)}
    >
      <Select.Trigger className="lo-select-trigger" aria-label="Filter by loan officer">
        <Select.Value placeholder="Loan officer" />
        <Select.Icon className="lo-select-icon">
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
            <path
              d="M3.5 6 8 10.5 12.5 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="lo-select-content" position="popper" sideOffset={6}>
          <Select.Viewport>
            <Select.Item value="all" className="lo-select-item">
              <Select.ItemText>All loan officers</Select.ItemText>
            </Select.Item>
            {officers.map((officer) => (
              <Select.Item key={officer.id} value={officer.id} className="lo-select-item">
                <Select.ItemText>
                  {officer.name} ({officer.count})
                </Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
