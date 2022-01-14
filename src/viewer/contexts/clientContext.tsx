import React from "react";
import { Client } from "../../client/client";

import { HttpClient } from "../../client/httpClient";

const ClientContext = React.createContext<{ client: Client }>({
  client: new HttpClient(),
});

export { ClientContext };
