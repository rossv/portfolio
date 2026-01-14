
export const COMPANY_COLORS = {
    "Wade Trim": "#43b02a",
    "KLH Engineers": "#496980",
    "KLH Engineers, Inc.": "#496980",
    "KLH Engineers Inc.": "#496980",
    "Civil & Environmental Consultants": "#fcb900",
    "Civil & Environmental Consultants, Inc.": "#fcb900",
    "University of Pittsburgh": "#083b97",
    "Earth Processes & Environmental Flows Group": "#083b97",
    "National Energy Technology Lab": "#3e3e3e",
    "National Energy Technology Laboratory (U.S. DOE)": "#3e3e3e",
    "Independent": "#64748b" // Slate-500 default
};

export const getCompanyColor = (companyName) => {
    if (!companyName) return "#64748b"; // Default slate
    return COMPANY_COLORS[companyName] || "#64748b";
};
