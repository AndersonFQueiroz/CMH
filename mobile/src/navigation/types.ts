// Tipagem central da Stack — issue #16 (RNF-04, tipagem estrita).
export type RootStackParamList = {
  ImovelList: undefined;
  ImovelDetail: { id: number };
  ImovelForm: { id?: number };
};
