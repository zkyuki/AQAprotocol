// TODO: Define dedicated types for properties respectively
class Data {
  provider: string;
  category: string;
  contents: any;

  constructor(provider: string, category: string, contents: string) {
    this.provider = provider;
    this.category = category;
    this.contents = contents;
  }
}

export { Data };
