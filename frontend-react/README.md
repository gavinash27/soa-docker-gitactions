# PassDesk — CrudService React frontend

React and Vite dashboard for the `BusPass` endpoints in the sibling Spring Boot `CrudService` project. The layout takes its navigation, centered forms, and green/cream palette from the supplied `reactapp` reference.

## Run locally

1. Start the backend on `http://localhost:8081` and make sure its PostgreSQL database is available.
2. From this directory, install dependencies with `npm install`.
3. Start the frontend with `npm run dev` and open the local URL printed by Vite.

The Vite development server proxies `/BusPass` requests to `http://localhost:8081`, so browser requests use the same origin and do not need a separate Spring CORS setting. Set `VITE_API_TARGET` in a local `.env` file to point the proxy at a different backend host.

## Service routes used

| Action | Request |
| --- | --- |
| List passes | `GET /BusPass/displayall` |
| Find a pass | `GET /BusPass/displaybyid?id={id}` |
| Create a pass | `POST /BusPass/add` |
| Update a pass | `PUT /BusPass/update/{id}` |
| Delete a pass | `DELETE /BusPass/delete/{id}` |

Create and update send `passNumber`, `holderName`, `validUntil`, and `fee`, matching the `BusPass` entity. The database-generated `id` is displayed in the directory.
