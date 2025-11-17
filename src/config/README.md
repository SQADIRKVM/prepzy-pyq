# Notes Sources Configuration

This directory contains configuration files for note sources and repositories.

## `notesSources.json`

This JSON file contains all the note sources and their configurations. You can add, remove, or modify sources here without changing the code.

### Structure

```json
{
  "repositories": {
    "SourceName": {
      "name": "Display Name",
      "baseUrl": "https://example.com",
      "type": "scheme-based" | "semester-based",
      "schemes": { ... },      // For scheme-based sources
      "semesters": { ... }     // For semester-based sources
    }
  },
  "subjectMappings": {
    "SourceName": {
      "Semester X": {
        "SUBJECT_CODE": ["keyword1", "keyword2", ...]
      }
    }
  }
}
```

### Adding a New Source

1. **Add Repository Configuration:**
   - Add a new entry in `repositories` object
   - For scheme-based sources (like KTUNotes.in), include `schemes` object
   - For semester-based sources (like RTPNotes), include `semesters` object

2. **Add Subject Mappings (if needed):**
   - If the source requires subject code to name mapping, add entries in `subjectMappings`
   - Map subject codes to arrays of keywords/variations that appear in the source

### Example: Adding a New Source

```json
{
  "repositories": {
    "NewSource": {
      "name": "New Notes Source",
      "baseUrl": "https://newnotes.com",
      "type": "semester-based",
      "semesters": {
        "1": "https://newnotes.com/semester-1",
        "2": "https://newnotes.com/semester-2"
      }
    }
  },
  "subjectMappings": {
    "NewSource": {
      "Semester 1": {
        "MAT101": ["mathematics", "math", "calculus"]
      }
    }
  }
}
```

### Notes

- The configuration is loaded automatically by `notesSearchService.ts`
- Changes to this file will be reflected immediately (no code changes needed)
- Make sure JSON syntax is valid before saving
