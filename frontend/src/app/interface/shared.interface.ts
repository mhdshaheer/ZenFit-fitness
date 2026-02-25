export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'email' | 'date' | 'status' | 'avatar' | 'approval';
  width?: string;
}

// Base interface for table data with common optional properties
export interface TableData {
  name?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  approvalStatus?: string;
}

export interface TableAction<T = TableData> {
  label: string;
  icon: string;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  action: string;
  condition?: (row: T) => boolean;
}

export interface ActionEvent<T = TableData> {
  action: string;
  row: T;
  index: number;
}
