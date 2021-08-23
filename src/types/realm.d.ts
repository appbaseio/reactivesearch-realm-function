type Services = {
  (name: "mongodb-atlas") : import("mongodb").MongoClient;
}

declare namespace context {
  const services: {
    get: Services;
  };
  const functions: {
    execute: (name: string, ...args: any[]) => any;
  };
  const user: {
    id: string;
    type: "normal" | "server" | "system";
    data: object;
    custom_data: object;
    identities: any[];
  };
}
