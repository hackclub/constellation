import "./App.css";
import Scene from "./components/Scene.tsx";

function App() {
    return (
        <div>
            <h1 className="text-3xl font-bold underline text-white z-10 fixed">Constellation</h1>
            <div className="w-full h-screen fixed z-0">
                <Scene />
            </div>
        </div>
    );
}

export default App;
