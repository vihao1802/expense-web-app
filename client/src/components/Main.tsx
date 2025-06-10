import { Box } from "@mui/material";
import ExpenseForm from "./ExpenseForm";
import TagList from "./TagList";
import Header from "./Header";
import Dashboard from "./Dashboard";
import { TagProvider } from "@/contexts/TagContext";
import { ExpenseProvider } from "@/contexts/ExpenseContext";

const Main = () => {
  return (
    <Box maxWidth="lg" sx={{ mx: 'auto' }}>
      <Header />
      <ExpenseProvider>
        <TagProvider>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 3, 
            p: 3
          }}>
            <Box sx={{ 
              flex: { md: 2 }, 
              minWidth: 0 
            }}>
              <ExpenseForm />
            </Box>
            
            <Box sx={{ 
              flex: { md: 1 }, 
              minWidth: 0 
            }}>
              <TagList />
            </Box>
          </Box>
          <Dashboard />
        </TagProvider>
      </ExpenseProvider>
    </Box>
  );
};

export default Main;