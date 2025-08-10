import { FileChangeData } from "../types/index";

interface DataStore {
  fileChangeData: FileChangeData | null;
}

export const dataStore: DataStore = {
  fileChangeData: null,
};
