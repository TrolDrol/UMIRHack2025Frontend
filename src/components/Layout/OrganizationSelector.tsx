import React, { useEffect } from "react";
import { useOrganizationStore } from "../../store/organization-store";

const OrganizationSelector: React.FC = () => {
  const {
    organizations,
    currentOrganization,
    loadOrganizations,
    setCurrentOrganization,
  } = useOrganizationStore();

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  const handleOrganizationChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const orgId = parseInt(e.target.value);
    const selectedOrg = organizations.find((org) => org.id === orgId) || null;
    setCurrentOrganization(selectedOrg);
  };

  if (organizations.length === 0) {
    return null;
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <label
        htmlFor="organization-select"
        style={{ fontSize: 14, color: "#2c3e50", fontWeight: 500 }}
      >
        Организация:
      </label>
      <select
        id="organization-select"
        value={currentOrganization?.id || ""}
        onChange={handleOrganizationChange}
        style={{
          padding: "8px 12px",
          border: "1px solid #bdc3c7",
          borderRadius: 4,
          fontSize: 14,
          backgroundColor: "white",
          color: "#2c3e50",
          minWidth: 200,
          cursor: "pointer",
        }}
      >
        <option value="">Выберите организацию</option>
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default OrganizationSelector;
