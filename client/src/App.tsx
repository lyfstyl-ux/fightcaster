import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import CharacterSelection from "@/pages/CharacterSelection";
import FindOpponent from "@/pages/FindOpponent";
import BattleArena from "@/pages/BattleArena";
import BattleResults from "@/pages/BattleResults";
import Challenges from "@/pages/Challenges";
import Leaderboard from "@/pages/Leaderboard";
import Profile from "@/pages/Profile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/select-character" component={CharacterSelection} />
      <Route path="/find-opponent" component={FindOpponent} />
      <Route path="/battle-arena" component={BattleArena} />
      <Route path="/battle-results" component={BattleResults} />
      <Route path="/challenges" component={Challenges} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
