// Previous types remain the same...

export interface SaleNote {
  id: string;
  saleId: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface Employment {
  employer: string;
  position: string;
  yearsEmployed: number;
  monthlyIncome: number;
  employerPhone: string;
  employerAddress: string;
}

export interface Reference {
  name: string;
  relationship: string;
  phone: string;
  address: string;
}

export interface BHPHApplication {
  employment: Employment;
  references: Reference[];
  previousAddresses: string[];
  yearsAtCurrentAddress: number;
  monthlyRent: number;
  otherIncome?: {
    source: string;
    amount: number;
  };
}