import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { useTags } from "@/contexts/TagContext";
import type { Tag } from "@/types/tag";
import MenuItem from "@mui/material/MenuItem";
import { getTagColor } from "@/utils/get_tag_color";

interface TagSelectorProps {
  value: string | null;
  onChange: (tagId: string | null) => void;
}

const TagSelector = ({ value, onChange }: TagSelectorProps) => {
  const { tags, loading, error: tagsError } = useTags();
  const selectedValue = value || (tags.length > 0 ? tags[0]._id : "");
  if (loading) {
    return (
      <Stack spacing={1} width="100%">
        <Skeleton variant="rectangular" height={56} />
      </Stack>
    );
  }

  if (tagsError) {
    return <Alert severity="error">{tagsError}</Alert>;
  }

  return (
    <TextField
      select
      margin="normal"
      fullWidth
      name="tag"
      value={selectedValue}
      onChange={(e) => onChange(e.target.value)}
      required
    >
      {tags.map((tag: Tag) => (
        <MenuItem key={tag._id} value={tag._id}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: tag.color || getTagColor(tag.name),
              }}
            />
            {tag.name}
          </Box>
        </MenuItem>
      ))}
    </TextField>
  );
};

export default TagSelector;
