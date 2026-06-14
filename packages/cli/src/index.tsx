import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import {createMemoryRouter, RouterProvider} from "react-router";
import {RootLayout} from "./layouts/root-layouts.tsx";
import {Home} from "./screens/home.tsx";
import {NewSession} from "./screens/new-session.tsx";
import { Session } from "./screens/sessions.tsx";

const router = createMemoryRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: "sessions/new", element: <NewSession /> },
            { path: "sessions/:id", element: <Session /> },
        ]
    }
]);

function App() {
    return <RouterProvider router={router} />;
}

const renderer = await createCliRenderer({
    targetFps: 60,
    exitOnCtrlC: false,
});
createRoot(renderer).render(<App />);