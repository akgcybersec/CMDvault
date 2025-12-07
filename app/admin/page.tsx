"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  getSession,
  getCommands,
  getTags,
  addCommand,
  updateCommand,
  deleteCommand,
  addTag,
  updateTag,
  deleteTag,
  updateCommandTags,
  getPlaceholders,
  addPlaceholder,
  updatePlaceholder,
  deletePlaceholder,
  getPlaceholderSets,
  addPlaceholderSet,
  updatePlaceholderSet,
  deletePlaceholderSet,
  getPlaceholderValues,
  addPlaceholderValue,
  updatePlaceholderValue,
  deletePlaceholderValue,
  getNotes,
  addNote,
  updateNote,
  deleteNote,
  updateNoteTags,
  getCommandSteps,
  updateCommandSteps,
  type Command,
  type Tag,
  type Placeholder,
  type PlaceholderSet,
  type PlaceholderValue,
  type Note,
  type CommandStep,
} from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Terminal, ArrowLeft, Trash2, Edit, Plus, Save, X, ChevronDown, ChevronUp, Settings } from "lucide-react"
import { ConfirmDialog, useConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import ReactMarkdown from "react-markdown"

export default function AdminPage() {
  const router = useRouter()
  const { confirm, ConfirmDialogComponent } = useConfirmDialog()
  const { toast } = useToast()
  const [commands, setCommands] = useState<Command[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([])
  const [placeholderSets, setPlaceholderSets] = useState<PlaceholderSet[]>([])
  const [placeholderValues, setPlaceholderValues] = useState<PlaceholderValue[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [activeTab, setActiveTab] = useState<"commands" | "tags" | "placeholders" | "placeholderSets" | "notes">("commands")
  const [editingCommand, setEditingCommand] = useState<Command | null>(null)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [editingPlaceholder, setEditingPlaceholder] = useState<Placeholder | null>(null)
  const [editingPlaceholderSet, setEditingPlaceholderSet] = useState<PlaceholderSet | null>(null)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    command: "",
    description: "",
    is_multi_step: false,
  })
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [tagForm, setTagForm] = useState({ name: "" })
  const [placeholderName, setPlaceholderName] = useState("")
  const [placeholderSetName, setPlaceholderSetName] = useState("")
  const [selectedPlaceholderSet, setSelectedPlaceholderSet] = useState<string>("")
  const [noteForm, setNoteForm] = useState({ title: "", content: "" })
  const [selectedNoteTagIds, setSelectedNoteTagIds] = useState<string[]>([])
  const [commandSteps, setCommandSteps] = useState<{ step_number: number; command: string; comment: string }[]>([])
  const [expandedEditor, setExpandedEditor] = useState(false)

  // Placeholder autocomplete state
  const [showPlaceholderAutocomplete, setShowPlaceholderAutocomplete] = useState(false)
  const [autocompleteIndex, setAutocompleteIndex] = useState(0)
  const [commandTextareaRef, setCommandTextareaRef] = useState<HTMLTextAreaElement | null>(null)
  const [activeStepIndexForAutocomplete, setActiveStepIndexForAutocomplete] = useState<number | null>(null)

  const [placeholderValueForm, setPlaceholderValueForm] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!getSession()) {
      router.push("/login")
      return
    }

    void loadData()
  }, [router])

  useEffect(() => {
    if (selectedPlaceholderSet) {
      void loadPlaceholderValues(selectedPlaceholderSet)
    }
  }, [selectedPlaceholderSet])

  const loadData = async () => {
    const [cmds, tgs, phs, sets, nts] = await Promise.all([
      getCommands(),
      getTags(),
      getPlaceholders(),
      getPlaceholderSets(),
      getNotes(),
    ])
    setCommands(cmds)
    setTags(tgs)
    setPlaceholders(phs)
    setPlaceholderSets(sets)
    setNotes(nts)
    if (sets.length > 0 && !selectedPlaceholderSet) {
      setSelectedPlaceholderSet(sets[0].id)
    }
  }

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteForm.title.trim() || !noteForm.content.trim()) return

    // Check for duplicate note title (excluding current note if editing)
    const isDuplicate = notes.some(note => 
      note.title.toLowerCase() === noteForm.title.toLowerCase().trim() && 
      (!editingNote || note.id !== editingNote.id)
    )

    if (isDuplicate) {
      toast({
        title: "Duplicate Note Title",
        description: `A note with the title "${noteForm.title.trim()}" already exists. Please choose a different title.`,
        variant: "destructive",
      })
      return
    }

    if (editingNote) {
      await updateNote(editingNote.id, { title: noteForm.title.trim(), content: noteForm.content.trim() })
      await updateNoteTags(editingNote.id, selectedNoteTagIds)
    } else {
      const newNote = await addNote(noteForm.title.trim(), noteForm.content.trim())
      if (selectedNoteTagIds.length > 0) {
        await updateNoteTags(newNote.id, selectedNoteTagIds)
      }
    }
    resetNoteForm()
    await loadData()
  }

  const handleDeleteNote = async (id: string) => {
    confirm({
      title: "Delete Note",
      message: "Are you sure you want to delete this note? This action cannot be undone.",
      onConfirm: async () => {
        await deleteNote(id)
        await loadData()
      },
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    })
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setNoteForm({
      title: note.title,
      content: note.content,
    })
    if (note.tags) {
      setSelectedNoteTagIds(note.tags.map((t) => t.id))
    } else {
      setSelectedNoteTagIds([])
    }
    setIsAdding(true)
    
    // Scroll to top of page smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetNoteForm = () => {
    setNoteForm({ title: "", content: "" })
    setSelectedNoteTagIds([])
    setEditingNote(null)
    setIsAdding(false)
  }

  const loadPlaceholderValues = async (setId: string) => {
    if (!setId) return
    const values = await getPlaceholderValues(setId)
    setPlaceholderValues(values)
    const formValues: Record<string, string> = {}
    for (const v of values) {
      formValues[v.placeholder_name] = v.default_value
    }
    // Ensure all placeholders have a value (empty string if not set)
    for (const ph of placeholders) {
      if (!(ph.name in formValues)) {
        formValues[ph.name] = ""
      }
    }
    setPlaceholderValueForm(formValues)
  }

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Check for duplicate command name (excluding current command if editing)
      const isDuplicate = commands.some(cmd => 
        cmd.name.toLowerCase() === formData.name.toLowerCase() && 
        (!editingCommand || cmd.id !== editingCommand.id)
      )

      if (isDuplicate) {
        toast({
          title: "Duplicate Command Name",
          description: `A command with the name "${formData.name}" already exists. Please choose a different name.`,
          variant: "destructive",
        })
        return
      }

      // Prepare command data
      let commandData = { ...formData }
      
      // For multi-step commands, convert steps to command string
      if (formData.is_multi_step && commandSteps.length > 0) {
        commandData.command = commandSteps.map(step => step.command).join('\n')
      }

      if (editingCommand) {
        await updateCommand(editingCommand.id, commandData)
        // Update tags
        await updateCommandTags(editingCommand.id, selectedTagIds)
      } else {
        const newCommand = await addCommand(commandData)
        // Add tags
        if (selectedTagIds.length > 0) {
          await updateCommandTags(newCommand.id, selectedTagIds)
        }
      }

      // Save command steps if it's a multi-step command
      if (formData.is_multi_step && commandSteps.length > 0) {
        const savedCommand = editingCommand || commands.find(cmd => cmd.name === formData.name)
        if (savedCommand) {
          await updateCommandSteps(savedCommand.id, commandSteps)
        }
      }

      resetForm()
      await loadData()
    } catch (error) {
      console.error("Failed to save command:", error)
      toast({
        title: "Save Failed",
        description: "Failed to save command. Check console for details.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCommand = async (id: string) => {
    confirm({
      title: "Delete Command",
      message: "Are you sure you want to delete this command? This action cannot be undone.",
      onConfirm: async () => {
        await deleteCommand(id)
        await loadData()
      },
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    })
  }

  const handlePlaceholderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!placeholderName.trim()) {
      toast({
        title: "Validation Error",
        description: "Placeholder name cannot be empty.",
        variant: "destructive",
      })
      return
    }
    
    // Validate placeholder name format
    const namePattern = /^[a-zA-Z0-9_]+$/
    if (!namePattern.test(placeholderName.trim())) {
      toast({
        title: "Invalid Format",
        description: "Placeholder names can only contain letters, numbers, and underscores (no spaces or special characters).",
        variant: "destructive",
      })
      return
    }
    
    // Check for duplicate placeholder name (excluding current placeholder if editing)
    const isDuplicate = placeholders.some(ph => 
      ph.name.toLowerCase() === placeholderName.toLowerCase().trim() && 
      (!editingPlaceholder || ph.id !== editingPlaceholder.id)
    )

    if (isDuplicate) {
      toast({
        title: "Duplicate Placeholder",
        description: `A placeholder with the name "${placeholderName.trim()}" already exists.`,
        variant: "destructive",
      })
      return
    }

    try {
      if (editingPlaceholder) {
        await updatePlaceholder(editingPlaceholder.id, { name: placeholderName.trim() })
      } else {
        await addPlaceholder(placeholderName.trim())
      }
      setPlaceholderName("")
      resetPlaceholderForm()
      await loadData()
    } catch (error) {
      console.error("Failed to save placeholder:", error)
      toast({
        title: "Save Failed",
        description: "Failed to save placeholder. Check console for details.",
        variant: "destructive",
      })
    }
  }

  const handleDeletePlaceholder = async (id: string) => {
    confirm({
      title: "Delete Placeholder",
      message: "Are you sure you want to delete this placeholder? This will affect all commands using this placeholder.",
      onConfirm: async () => {
        await deletePlaceholder(id)
        await loadData()
      },
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    })
  }

  const handleEditPlaceholder = (ph: Placeholder) => {
    setEditingPlaceholder(ph)
    setPlaceholderName(ph.name)
    setIsAdding(true)
    
    // Scroll to top of page smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePlaceholderSetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!placeholderSetName.trim()) return
    if (editingPlaceholderSet) {
      await updatePlaceholderSet(editingPlaceholderSet.id, { name: placeholderSetName.trim() })
    } else {
      await addPlaceholderSet(placeholderSetName.trim())
    }
    setPlaceholderSetName("")
    resetPlaceholderSetForm()
    await loadData()
  }

  const handleDeletePlaceholderSet = async (id: string) => {
    confirm({
      title: "Delete Placeholder Set",
      message: "Are you sure you want to delete this placeholder set? All associated default values will be deleted.",
      onConfirm: async () => {
        await deletePlaceholderSet(id)
        if (selectedPlaceholderSet === id) {
          setSelectedPlaceholderSet("")
        }
        await loadData()
      },
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    })
  }

  const handleEditPlaceholderSet = (set: PlaceholderSet) => {
    setEditingPlaceholderSet(set)
    setPlaceholderSetName(set.name)
    setIsAdding(true)
    
    // Scroll to top of page smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetPlaceholderSetForm = () => {
    setPlaceholderSetName("")
    setEditingPlaceholderSet(null)
    setIsAdding(false)
  }

  const handlePlaceholderValueChange = (placeholderName: string, value: string) => {
    setPlaceholderValueForm((prev) => ({ ...prev, [placeholderName]: value }))
  }

  const handleSavePlaceholderValues = async () => {
    if (!selectedPlaceholderSet) return
    try {
      for (const [placeholderName, defaultValue] of Object.entries(placeholderValueForm)) {
        await updatePlaceholderValue(selectedPlaceholderSet, placeholderName, defaultValue)
      }
      await loadPlaceholderValues(selectedPlaceholderSet)
      toast({
        title: "Success",
        description: "Placeholder values saved successfully!",
      })
    } catch (error) {
      console.error("Failed to save placeholder values:", error)
      toast({
        title: "Save Failed",
        description: "Failed to save placeholder values. Check console for details.",
        variant: "destructive",
      })
    }
  }

  const handleEditCommand = async (cmd: Command) => {
    setEditingCommand(cmd)
    setFormData({
      name: cmd.name,
      command: cmd.command,
      description: cmd.description,
      is_multi_step: cmd.is_multi_step,
    })
    
    // Set selected tags
    if (cmd.tags) {
      setSelectedTagIds(cmd.tags.map(tag => tag.id))
    } else {
      setSelectedTagIds([])
    }
    
    // Load command steps if it's a multi-step command
    if (cmd.is_multi_step) {
      try {
        const steps = await getCommandSteps(cmd.id)

        // If there are no persisted step rows yet, derive steps from the stored command string
        if (!steps || steps.length === 0) {
          const fallbackSteps = cmd.command
            .split('\n')
            .filter((step) => step.trim())
            .map((step, index) => ({
              step_number: index + 1,
              command: step.trim(),
              comment: '',
            }))
          setCommandSteps(fallbackSteps)
        } else {
          setCommandSteps(
            steps.map((step) => ({
              step_number: step.step_number,
              command: step.command,
              comment: step.comment,
            })),
          )
        }

        setExpandedEditor(true)
      } catch (error) {
        console.error("Failed to load command steps:", error)
        // Fallback to parsing the command string if API fails
        const fallbackSteps = cmd.command
          .split('\n')
          .filter((step) => step.trim())
          .map((step, index) => ({
            step_number: index + 1,
            command: step.trim(),
            comment: '',
          }))
        setCommandSteps(fallbackSteps)
        setExpandedEditor(true)
      }
    } else {
      setCommandSteps([])
      setExpandedEditor(false)
    }
    
    setIsAdding(true)
    
    // Scroll to top of page smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      command: "",
      description: "",
      is_multi_step: false,
    })
    setSelectedTagIds([])
    setEditingCommand(null)
    setIsAdding(false)
    setCommandSteps([])
    setExpandedEditor(false)
  }

  const handleTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tagForm.name.trim()) return
    
    try {
      if (editingTag) {
        await updateTag(editingTag.id, { name: tagForm.name.trim() })
      } else {
        await addTag({ name: tagForm.name.trim() })
      }
      setTagForm({ name: "" })
      resetTagForm()
      await loadData()
    } catch (error) {
      console.error("Failed to save tag:", error)
      toast({
        title: "Save Failed",
        description: "Failed to save tag. Check console for details.",
        variant: "destructive",
      })
    }
  }

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag)
    setTagForm({ name: tag.name })
    setIsAdding(true)
    
    // Scroll to top of page smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetTagForm = () => {
    setTagForm({ name: "" })
    setEditingTag(null)
    setIsAdding(false)
  }

  const handleDeleteTag = async (id: string) => {
    confirm({
      title: "Delete Tag",
      message: "Are you sure you want to delete this tag? This will remove the tag from all commands using it.",
      onConfirm: async () => {
        await deleteTag(id)
        await loadData()
      },
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    })
  }

  // Multi-step editor functions
  const handleMultiStepToggle = (checked: boolean) => {
    setFormData({ ...formData, is_multi_step: checked })
    if (checked) {
      setExpandedEditor(true)
      // Initialize with current command as first step if it exists
      if (formData.command.trim()) {
        const steps = formData.command.split('\n').filter((step, index) => step.trim()).map((step, index) => ({
          step_number: index + 1,
          command: step.trim(),
          comment: ''
        }))
        setCommandSteps(steps.length > 0 ? steps : [{ step_number: 1, command: '', comment: '' }])
      } else {
        setCommandSteps([{ step_number: 1, command: '', comment: '' }])
      }
    } else {
      setExpandedEditor(false)
      // Convert steps back to single command string
      const commandString = commandSteps.map(step => step.command).join('\n')
      setFormData({ ...formData, command: commandString, is_multi_step: false })
      setCommandSteps([])
    }
  }

  const addStep = () => {
    const newStepNumber = commandSteps.length + 1
    setCommandSteps([...commandSteps, { step_number: newStepNumber, command: '', comment: '' }])
  }

  const updateStep = (index: number, field: 'command' | 'comment', value: string) => {
    const updatedSteps = [...commandSteps]
    updatedSteps[index] = { ...updatedSteps[index], [field]: value }
    setCommandSteps(updatedSteps)
  }

  const removeStep = (index: number) => {
    const updatedSteps = commandSteps.filter((_, i) => i !== index)
    // Renumber steps
    const renumberedSteps = updatedSteps.map((step, i) => ({ ...step, step_number: i + 1 }))
    setCommandSteps(renumberedSteps)
  }

  const resetPlaceholderForm = () => {
    setPlaceholderName("")
    setEditingPlaceholder(null)
    setIsAdding(false)
  }

  const handleCommandInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setFormData({ ...formData, command: value })

    const cursorPos = e.target.selectionStart
    const beforeCursor = value.slice(0, cursorPos)
    const openBracesMatch = beforeCursor.match(/\{\{$/)

    if (openBracesMatch) {
      setShowPlaceholderAutocomplete(true)
      setAutocompleteIndex(0)
      setActiveStepIndexForAutocomplete(null)
    } else {
      setShowPlaceholderAutocomplete(false)
    }
  }

  const handleStepCommandInput = (index: number, e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    // Update the step content
    updateStep(index, "command", value)

    // Detect `{{` immediately before the cursor position
    const cursorPos = e.target.selectionStart
    const beforeCursor = value.slice(0, cursorPos)
    const openBracesMatch = beforeCursor.match(/\{\{$/)

    if (openBracesMatch) {
      setShowPlaceholderAutocomplete(true)
      setAutocompleteIndex(0)
      setActiveStepIndexForAutocomplete(index)
    } else {
      setShowPlaceholderAutocomplete(false)
      setActiveStepIndexForAutocomplete(null)
    }
  }

  const insertPlaceholder = (placeholder: string, stepIndex?: number) => {
    // If a specific step index is provided, always target that step
    if (typeof stepIndex === "number") {
      if (stepIndex < 0 || stepIndex >= commandSteps.length) {
        setShowPlaceholderAutocomplete(false)
        setActiveStepIndexForAutocomplete(null)
        return
      }

      const updatedSteps = [...commandSteps]
      const current = updatedSteps[stepIndex]
      const currentText = current.command || ""
      const newText = currentText.replace(/\{\{$/, `{{${placeholder}}}`)
      updatedSteps[stepIndex] = { ...current, command: newText }
      setCommandSteps(updatedSteps)
      setShowPlaceholderAutocomplete(false)
      setActiveStepIndexForAutocomplete(null)
      return
    }

    // If we're in single-command mode, operate on the main textarea
    if (activeStepIndexForAutocomplete === null) {
      if (!commandTextareaRef) return
      const value = commandTextareaRef.value
      const cursorPos = commandTextareaRef.selectionStart
      const beforeCursor = value.slice(0, cursorPos)
      const afterCursor = value.slice(cursorPos)
      const newValue = beforeCursor.replace(/\{\{$/, `{{${placeholder}}}`) + afterCursor
      setFormData({ ...formData, command: newValue })
      setShowPlaceholderAutocomplete(false)
      // Focus back and set cursor after inserted placeholder
      setTimeout(() => {
        commandTextareaRef.focus()
        const newCursorPos = beforeCursor.replace(/\{\{$/, `{{${placeholder}}}`).length
        commandTextareaRef.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
      return
    }

    // Otherwise we're inside a specific multi-step command textarea determined by state
    const derivedIndex = activeStepIndexForAutocomplete
    if (derivedIndex === null || derivedIndex < 0 || derivedIndex >= commandSteps.length) {
      setShowPlaceholderAutocomplete(false)
      setActiveStepIndexForAutocomplete(null)
      return
    }

    const updatedSteps = [...commandSteps]
    const current = updatedSteps[derivedIndex]
    const currentText = current.command || ""
    const newText = currentText.replace(/\{\{$/, `{{${placeholder}}}`)
    updatedSteps[derivedIndex] = { ...current, command: newText }
    setCommandSteps(updatedSteps)
    setShowPlaceholderAutocomplete(false)
    setActiveStepIndexForAutocomplete(null)
  }

  const handleAutocompleteKeyDown = (e: React.KeyboardEvent, stepIndex?: number) => {
    if (!showPlaceholderAutocomplete) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setAutocompleteIndex((prev) => (prev + 1) % placeholders.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setAutocompleteIndex((prev) => (prev - 1 + placeholders.length) % placeholders.length)
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (placeholders[autocompleteIndex]) {
        insertPlaceholder(placeholders[autocompleteIndex].name, stepIndex)
      }
    } else if (e.key === "Escape") {
      e.preventDefault()
      setShowPlaceholderAutocomplete(false)
      setActiveStepIndexForAutocomplete(null)
    }
  }

  const configTabValue: "tags" | "placeholders" | "placeholderSets" | undefined =
    activeTab === "placeholders" || activeTab === "placeholderSets" || activeTab === "tags"
      ? activeTab
      : undefined

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#020617]">
      {/* Header */}
      <header className="border-b border-primary/40 bg-card/95 shadow-[0_1px_0_rgba(15,23,42,0.9)]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold font-mono text-foreground">
                CMDvault – Editor
              </h1>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/vault")} className="font-mono">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Vault
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Primary content tabs */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeTab === "commands" ? "default" : "outline"}
              onClick={() => {
                setActiveTab("commands")
                resetForm()
                resetTagForm()
              }}
              className="font-mono"
            >
              Commands
            </Button>
            <Button
              variant={activeTab === "notes" ? "default" : "outline"}
              onClick={() => {
                setActiveTab("notes")
                resetForm()
                resetTagForm()
              }}
              className="font-mono"
            >
              Notes
            </Button>
          </div>

          {/* Config dropdown on the right */}
          <div className="ml-auto w-full sm:w-auto flex justify-start sm:justify-end">
            <Select
              value={configTabValue}
              onValueChange={(value) => {
                const v = value as "tags" | "placeholders" | "placeholderSets"
                setActiveTab(v)
                resetForm()
                resetTagForm()
              }}
            >
              <SelectTrigger className="w-full sm:w-48 h-9 px-3 font-mono text-xs bg-transparent border border-border flex items-center gap-2 hover:bg-muted/40">
                <Settings className="w-3 h-3" />
                <SelectValue>
                  {!configTabValue
                    ? "Config"
                    : configTabValue === "tags"
                      ? "Tags"
                      : configTabValue === "placeholders"
                        ? "Placeholders"
                        : "Placeholder Sets"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tags" className="font-mono text-xs">
                  Tags
                </SelectItem>
                <SelectItem value="placeholders" className="font-mono text-xs">
                  Placeholders
                </SelectItem>
                <SelectItem value="placeholderSets" className="font-mono text-xs">
                  Placeholder Sets
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Commands Tab */}
        {activeTab === "commands" && (
          <div className="space-y-6">
            {!isAdding ? (
              <Button onClick={() => setIsAdding(true)} className="font-mono">
                <Plus className="w-4 h-4 mr-2" />
                Add Command
              </Button>
            ) : (
              <div className="bg-card/95 border border-primary/40 rounded-lg p-5 shadow-md shadow-black/50 hover:border-primary hover:shadow-[0_0_24px_rgba(34,197,94,0.28)] transition-colors duration-200">
                <div className="flex justify-end mb-2">
                  <Button variant="ghost" size="sm" onClick={resetForm} className="h-6 w-6 p-0">
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <form onSubmit={handleCommandSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-mono text-muted-foreground">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-mono text-muted-foreground">
                      Tags
                    </Label>
                    <div className="border border-border/80 rounded-lg p-3 bg-background/90 shadow-[0_0_0_1px_rgba(15,23,42,0.9)]">
                      {tags.length === 0 ? (
                        <p className="text-xs text-muted-foreground font-mono">No tags available. Create tags first.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => {
                            const active = selectedTagIds.includes(tag.id)
                            return (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => {
                                  if (active) {
                                    setSelectedTagIds(selectedTagIds.filter((id) => id !== tag.id))
                                  } else {
                                    setSelectedTagIds([...selectedTagIds, tag.id])
                                  }
                                }}
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-mono border transition-colors ${
                                  active
                                    ? "bg-primary/90 text-primary-foreground border-primary shadow-sm"
                                    : "bg-background/80 text-muted-foreground border-border hover:border-primary/70 hover:text-foreground"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    active ? "bg-primary-foreground" : "bg-primary/70"
                                  }`}
                                />
                                {tag.name}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      Select multiple tags to categorize this command
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="command" className="font-mono text-muted-foreground">
                      Command
                    </Label>
                    
                    {!formData.is_multi_step ? (
                      // Single command mode
                      <div className="relative">
                        <Textarea
                          id="command"
                          ref={setCommandTextareaRef}
                          value={formData.command}
                          onChange={handleCommandInput}
                          onKeyDown={handleAutocompleteKeyDown}
                          className="font-mono"
                          placeholder="nmap -sV -O {{target}}"
                          rows={3}
                          required
                        />
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          Use {"{{placeholder}}"} for dynamic values.
                        </p>

                        {showPlaceholderAutocomplete && placeholders.length > 0 && activeStepIndexForAutocomplete === null && (
                          <div className="absolute left-0 top-full mt-2 z-50 w-56 rounded-md border border-primary/60 bg-card/95 shadow-lg shadow-black/60">
                            <div className="max-h-40 overflow-y-auto overscroll-contain">
                              {placeholders.map((ph, idx) => (
                                <button
                                  key={ph.id}
                                  type="button"
                                  onClick={() => insertPlaceholder(ph.name)}
                                  onMouseEnter={() => setAutocompleteIndex(idx)}
                                  className={`w-full text-left px-3 py-2 text-xs font-mono transition-colors ${
                                    idx === autocompleteIndex
                                      ? "bg-primary/90 text-primary-foreground"
                                      : "bg-transparent text-foreground hover:bg-primary/20"
                                  }`}
                                >
                                  {ph.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Multi-step command mode
                      <div className={`border border-border rounded-lg overflow-hidden transition-all duration-300 ${expandedEditor ? 'bg-background/50' : ''}`}>
                        <div 
                          className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setExpandedEditor(!expandedEditor)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono font-medium">
                              {commandSteps.length} step{commandSteps.length !== 1 ? 's' : ''}
                            </span>
                            {commandSteps.some(step => step.comment.trim()) && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-mono">
                                Has comments
                              </span>
                            )}
                          </div>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedEditor ? 'rotate-180' : ''}`} />
                        </div>
                        
                        <div className={`transition-all duration-300 ${expandedEditor ? 'max-h-[70vh] opacity-100' : 'max-h-0 opacity-0'} overflow-y-auto overflow-x-hidden`}>
                          <div className="p-3 pt-0 space-y-3">
                            {commandSteps.map((step, index) => (
                              <div key={index} className="border border-border rounded-lg p-3 bg-card">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-mono font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                                      Step {step.step_number}
                                    </span>
                                  </div>
                                  {commandSteps.length > 1 && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => removeStep(index)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                                
                                <div className="space-y-2 relative">
                                  <Textarea
                                    value={step.command}
                                    onChange={(e) => handleStepCommandInput(index, e)}
                                    onKeyDown={handleAutocompleteKeyDown}
                                    className="font-mono text-sm"
                                    placeholder="Enter command for this step..."
                                    rows={2}
                                  />

                                  {showPlaceholderAutocomplete && placeholders.length > 0 && activeStepIndexForAutocomplete === index && (
                                    <div className="absolute left-0 top-full mt-2 z-50 w-56 rounded-md border border-primary/60 bg-card/95 shadow-lg shadow-black/60">
                                      <div className="max-h-40 overflow-y-auto overscroll-contain">
                                        {placeholders.map((ph, idx) => (
                                          <button
                                            key={ph.id}
                                            type="button"
                                            onClick={() => insertPlaceholder(ph.name)}
                                            onMouseEnter={() => setAutocompleteIndex(idx)}
                                            className={`w-full text-left px-3 py-2 text-xs font-mono transition-colors ${
                                              idx === autocompleteIndex
                                                ? "bg-primary/90 text-primary-foreground"
                                                : "bg-transparent text-foreground hover:bg-primary/20"
                                            }`}
                                          >
                                            {ph.name}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  <Input
                                    value={step.comment}
                                    onChange={(e) => updateStep(index, 'comment', e.target.value)}
                                    className="font-mono text-sm"
                                    placeholder="Add comment for this step (optional)..."
                                  />
                                </div>
                              </div>
                            ))}
                            
                            <Button
                              type="button"
                              variant="outline"
                              onClick={addStep}
                              className="w-full font-mono text-sm"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Step
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="checkbox"
                        id="is_multi_step"
                        checked={formData.is_multi_step}
                        onChange={(e) => handleMultiStepToggle(e.target.checked)}
                        className="font-mono"
                      />
                      <Label htmlFor="is_multi_step" className="font-mono text-muted-foreground flex items-center gap-2">
                        Multi-step command with comments
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="font-mono text-muted-foreground">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="font-mono"
                      rows={2}
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="font-mono">
                      <Save className="w-4 h-4 mr-2" />
                      {editingCommand ? "Update" : "Create"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm} className="font-mono bg-transparent">
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Commands List */}
            <div className="space-y-4">
              {commands.map((cmd) => (
                <div
                  key={cmd.id}
                  className="bg-card/95 border border-primary/30 rounded-lg p-4 shadow-md shadow-black/50 hover:border-primary hover:shadow-[0_0_22px_rgba(34,197,94,0.25)] transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold font-mono text-foreground">{cmd.name}</h3>
                        {cmd.tags && cmd.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {cmd.tags.map((tag) => (
                              <span
                                key={tag.id}
                                className="text-[11px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full"
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 font-mono">{cmd.description}</p>
                      <div className="bg-background border border-border rounded p-2 mt-3">
                        <code className="text-sm font-mono text-foreground break-all">{cmd.command}</code>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => handleEditCommand(cmd)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteCommand(cmd.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags Tab */}
        {activeTab === "tags" && (
          <div className="space-y-6">
            {!isAdding ? (
              <Button onClick={() => setIsAdding(true)} className="font-mono">
                <Plus className="w-4 h-4 mr-2" />
                Add Tag
              </Button>
            ) : (
              <div className="bg-card/95 border border-primary/40 rounded-lg p-6 shadow-md shadow-black/50 hover:border-primary hover:shadow-[0_0_24px_rgba(34,197,94,0.28)] transition-colors duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold font-mono text-foreground">
                    {editingTag ? "Edit Tag" : "New Tag"}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={resetTagForm}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <form onSubmit={handleTagSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tagName" className="font-mono text-muted-foreground">
                      Tag Name
                    </Label>
                    <Input
                      id="tagName"
                      value={tagForm.name}
                      onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
                      className="font-mono"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="font-mono">
                      <Save className="w-4 h-4 mr-2" />
                      {editingTag ? "Update" : "Create"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetTagForm}
                      className="font-mono bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Tags List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="bg-card/95 border border-primary/30 rounded-lg p-4 shadow-md shadow-black/50 hover:border-primary hover:shadow-[0_0_22px_rgba(34,197,94,0.25)] transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold font-mono text-foreground">{tag.name}</h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditTag(tag)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteTag(tag.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 font-mono">
                    {commands.filter((c) => c.tags && c.tags.some(t => t.id === tag.id)).length} commands
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Placeholders Tab */}
        {activeTab === "placeholders" && (
          <div className="space-y-6">
            {!isAdding ? (
              <Button onClick={() => setIsAdding(true)} className="font-mono">
                <Plus className="w-4 h-4 mr-2" />
                Add Placeholder
              </Button>
            ) : (
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold font-mono text-foreground">
                    {editingPlaceholder ? "Edit Placeholder" : "New Placeholder"}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={resetPlaceholderForm}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <form onSubmit={handlePlaceholderSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="placeholderName" className="font-mono text-muted-foreground">
                      Placeholder Name
                    </Label>
                    <Input
                      id="placeholderName"
                      value={placeholderName}
                      onChange={(e) => setPlaceholderName(e.target.value)}
                      className="font-mono"
                      placeholder="target"
                      pattern="[a-zA-Z0-9_]+"
                      title="Only letters, numbers, and underscores (no spaces or special characters)"
                      required
                    />
                    <p className="text-xs text-muted-foreground font-mono">
                      Only letters, numbers, and underscores. Use in commands as {"{{placeholderName}}"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="font-mono">
                      <Save className="w-4 h-4 mr-2" />
                      {editingPlaceholder ? "Update" : "Create"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetPlaceholderForm}
                      className="font-mono bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Existing Placeholders List */}
            <div className="space-y-4">
              {placeholders.length === 0 ? (
                <div className="text-center py-12 bg-card/95 border border-primary/30 rounded-lg shadow-md shadow-black/50">
                  <p className="text-muted-foreground font-mono">No placeholders defined</p>
                </div>
              ) : (
                placeholders.map((ph) => (
                  <div
                    key={ph.id}
                    className="bg-card/95 border border-primary/30 rounded-lg p-4 shadow-md shadow-black/50 hover:border-primary hover:shadow-[0_0_22px_rgba(34,197,94,0.25)] transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold font-mono text-foreground mb-1">{ph.name}</h3>
                        <p className="text-xs text-muted-foreground font-mono">Use as {"{{" + ph.name + "}}"}</p>
                      </div>
                      <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditPlaceholder(ph)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeletePlaceholder(ph.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Placeholder Sets Tab */}
        {activeTab === "placeholderSets" && (
          <div className="space-y-6">
            {/* Add/Edit Set Form */}
            {!isAdding ? (
              <Button onClick={() => setIsAdding(true)} className="font-mono">
                <Plus className="w-4 h-4 mr-2" />
                Add Placeholder Set
              </Button>
            ) : (
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold font-mono text-foreground">
                    {editingPlaceholderSet ? "Edit Placeholder Set" : "New Placeholder Set"}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={resetPlaceholderSetForm}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <form onSubmit={handlePlaceholderSetSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="placeholderSetName" className="font-mono text-muted-foreground">
                      Set Name
                    </Label>
                    <Input
                      id="placeholderSetName"
                      value={placeholderSetName}
                      onChange={(e) => setPlaceholderSetName(e.target.value)}
                      className="font-mono"
                      placeholder="production"
                      required
                    />
                    <p className="text-xs text-muted-foreground font-mono">
                      Only letters, numbers, and underscores. This will be shown in the Vault page.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="font-mono">
                      <Save className="w-4 h-4 mr-2" />
                      {editingPlaceholderSet ? "Update" : "Create"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetPlaceholderSetForm}
                      className="font-mono bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Sets List and Values */}
            {placeholderSets.length === 0 ? (
              <div className="text-center py-12 bg-card/95 border border-primary/30 rounded-lg shadow-md shadow-black/50">
                <p className="text-muted-foreground font-mono">No placeholder sets defined</p>
              </div>
            ) : (
              <div className="space-y-6">

                {/* Set List (click card to select set) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {placeholderSets.map((set) => {
                    const isActive = selectedPlaceholderSet === set.id
                    return (
                      <div
                        key={set.id}
                        className={`bg-card/95 border rounded-lg p-4 shadow-md shadow-black/50 cursor-pointer transition-colors duration-200 ${
                          isActive
                            ? "border-primary shadow-[0_0_24px_rgba(34,197,94,0.3)]"
                            : "border-primary/30 hover:border-primary hover:shadow-[0_0_22px_rgba(34,197,94,0.25)]"
                        }`}
                        onClick={() => setSelectedPlaceholderSet(set.id)}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold font-mono text-foreground">{set.name}</h3>
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button size="sm" variant="outline" onClick={() => handleEditPlaceholderSet(set)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeletePlaceholderSet(set.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Default Values for Selected Set */}
                {selectedPlaceholderSet && (
                  <div className="bg-card/95 border border-primary/40 rounded-lg p-6 shadow-md shadow-black/50 hover:border-primary hover:shadow-[0_0_24px_rgba(34,197,94,0.28)] transition-colors duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold font-mono text-foreground">
                        Default Values for {placeholderSets.find((s) => s.id === selectedPlaceholderSet)?.name}
                      </h3>
                      <Button onClick={handleSavePlaceholderValues} className="font-mono">
                        <Save className="w-4 h-4 mr-2" />
                        Save Values
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {placeholders.length === 0 ? (
                        <p className="text-muted-foreground font-mono">No placeholders defined. Add placeholders first.</p>
                      ) : (
                        placeholders.map((ph) => (
                          <div key={ph.id} className="space-y-2">
                            <Label htmlFor={`value-${ph.id}`} className="font-mono text-muted-foreground">
                              {ph.name}
                            </Label>
                            <Input
                              id={`value-${ph.id}`}
                              value={placeholderValueForm[ph.name] || ""}
                              onChange={(e) => handlePlaceholderValueChange(ph.name, e.target.value)}
                              className="font-mono"
                              placeholder={`Default value for ${ph.name}`}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === "notes" && (
          <div className="space-y-6">
            {/* Add/Edit Note Form */}
            {!isAdding ? (
              <Button onClick={() => setIsAdding(true)} className="font-mono">
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            ) : (
              <div className="bg-card/95 border border-border/80 rounded-lg p-5 shadow-md shadow-black/50">
                <div className="flex justify-end mb-2">
                  <Button variant="ghost" size="sm" onClick={resetNoteForm} className="h-6 w-6 p-0">
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <form onSubmit={handleNoteSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="noteTitle" className="font-mono text-muted-foreground">
                      Title
                    </Label>
                    <Input
                      id="noteTitle"
                      value={noteForm.title}
                      onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                      className="font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-mono text-muted-foreground">
                      Tags
                    </Label>
                    <div className="border border-border rounded-lg p-3 bg-background">
                      {tags.length === 0 ? (
                        <p className="text-xs text-muted-foreground font-mono">No tags available. Create tags first.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => {
                            const active = selectedNoteTagIds.includes(tag.id)
                            return (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => {
                                  if (active) {
                                    setSelectedNoteTagIds(selectedNoteTagIds.filter((id) => id !== tag.id))
                                  } else {
                                    setSelectedNoteTagIds([...selectedNoteTagIds, tag.id])
                                  }
                                }}
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-mono border transition-colors ${
                                  active
                                    ? "bg-primary/90 text-primary-foreground border-primary shadow-sm"
                                    : "bg-background/80 text-muted-foreground border-border hover:border-primary/70 hover:text-foreground"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    active ? "bg-primary-foreground" : "bg-primary/70"
                                  }`}
                                />
                                {tag.name}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      Select tags to categorize this note
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="noteContent" className="font-mono text-muted-foreground">
                      Content (Markdown)
                    </Label>
                    <div className="border-2 border-border rounded-lg overflow-hidden bg-muted/30">
                      <Textarea
                        id="noteContent"
                        value={noteForm.content}
                        onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                        className="font-mono text-sm border-0 bg-transparent resize-none focus:ring-0 focus:border-0"
                        placeholder="# Note title

## Overview
Describe the attack methodology here...

## Commands
```bash
nmap -sV {{target}}
```

## Notes
- **Important**: Remember to...
- Use **bold** for emphasis
- Use `code` for commands"
                        rows={15}
                        style={{ minHeight: "400px" }}
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-mono mt-1">
                      <p>Supports markdown: # headers, **bold**, *italic*, `code`, ```blocks```, - lists</p>
                      <p>{noteForm.content.length} characters</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="font-mono">
                      <Save className="w-4 h-4 mr-2" />
                      {editingNote ? "Update" : "Create"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetNoteForm}
                      className="font-mono bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Notes List */}
            {notes.length === 0 ? (
              <div className="text-center py-12 bg-card/95 border border-primary/30 rounded-lg shadow-md shadow-black/50">
                <p className="text-muted-foreground font-mono">No notes defined</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-card/95 border border-primary/30 rounded-lg p-4 shadow-md shadow-black/50 hover:border-primary hover:shadow-[0_0_22px_rgba(34,197,94,0.25)] transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold font-mono text-foreground mb-1">{note.title}</h3>
                        <p className="text-sm text-muted-foreground font-mono mt-2 whitespace-pre-line">
                          {note.content.slice(0, 160)}{note.content.length > 160 ? "\n..." : ""}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditNote(note)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteNote(note.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
      <ConfirmDialogComponent />
    </>
  )
}
