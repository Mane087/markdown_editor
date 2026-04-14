interface SaveFilePickerWritable {
  write(data: Blob): Promise<void>;
  close(): Promise<void>;
}

interface SaveFilePickerHandle {
  createWritable(): Promise<SaveFilePickerWritable>;
}

export interface SaveFilePickerWindow extends Window {
  showSaveFilePicker?: (options: {
    suggestedName: string;
    excludeAcceptAllOption?: boolean;
    types: {
      description: string;
      accept: Record<string, readonly string[]>;
    }[];
  }) => Promise<SaveFilePickerHandle>;
}
