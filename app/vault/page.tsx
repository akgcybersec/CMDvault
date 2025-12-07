"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  getSession,
  getCommands,
  getTags,
  getPlaceholderSets,
  getPlaceholderValues,
  getNotes,
  getCommandSteps,
  type Command,
  type Tag,
  type PlaceholderSet,
  type PlaceholderValue,
  type Note,
  type CommandStep,
  clearSession,
} from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Terminal, LogOut, Settings, Copy, Check, Search, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ReactMarkdown from "react-markdown"

export default function VaultPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [commands, setCommands] = useState<Command[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [placeholderSets, setPlaceholderSets] = useState<PlaceholderSet[]>([])
  const [placeholderValues, setPlaceholderValues] = useState<PlaceholderValue[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedPlaceholderSet, setSelectedPlaceholderSet] = useState<string>("none")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [viewFilter, setViewFilter] = useState<"commands" | "notes">("commands")
  const [compactView, setCompactView] = useState(false)
  const [expandedCommandId, setExpandedCommandId] = useState<string | null>(null)
  const [placeholders, setPlaceholders] = useState<Record<string, string>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copiedSubId, setCopiedSubId] = useState<string | null>(null)
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null)
  const [commandSteps, setCommandSteps] = useState<Record<string, CommandStep[]>>({})

  useEffect(() => {
    if (!getSession()) {
      router.push("/login")
      return
    }

    // Restore view preferences from sessionStorage
    try {
      const raw = sessionStorage.getItem("vaultViewPrefs")
      if (raw) {
        const parsed = JSON.parse(raw) as {
          viewFilter?: "commands" | "notes"
          compactView?: boolean
        }
        if (parsed.viewFilter === "commands" || parsed.viewFilter === "notes") {
          setViewFilter(parsed.viewFilter)
        }
        if (typeof parsed.compactView === "boolean") {
          setCompactView(parsed.compactView)
        }
      }
    } catch {
      // ignore corrupt prefs
    }

    void loadData()
  }, [router])

  // Persist view preferences for this session
  useEffect(() => {
    try {
      const data = JSON.stringify({ viewFilter, compactView })
      sessionStorage.setItem("vaultViewPrefs", data)
    } catch {
      // ignore storage failures
    }
  }, [viewFilter, compactView])

  useEffect(() => {
    if (selectedPlaceholderSet && selectedPlaceholderSet !== "none") {
      void loadPlaceholderValues(selectedPlaceholderSet)
    } else {
      setPlaceholders({})
    }
  }, [selectedPlaceholderSet])

  const loadData = async () => {
    const [cmds, tgs, sets, nts] = await Promise.all([
      getCommands(),
      getTags(),
      getPlaceholderSets(),
      getNotes(),
    ])
    setCommands(cmds)
    setTags(tgs)
    setPlaceholderSets(sets)
    setNotes(nts)
    
    // Load command steps for multi-step commands
    const multiStepCommands = cmds.filter(cmd => cmd.is_multi_step)
    const stepsData: Record<string, CommandStep[]> = {}
    
    for (const cmd of multiStepCommands) {
      try {
        const steps = await getCommandSteps(cmd.id)
        stepsData[cmd.id] = steps
      } catch (error) {
        console.error(`Failed to load steps for command ${cmd.id}:`, error)
        stepsData[cmd.id] = []
      }
    }
    
    setCommandSteps(stepsData)
  }

  const loadPlaceholderValues = async (setId: string) => {
    const values = await getPlaceholderValues(setId)
    setPlaceholderValues(values)
    const newPlaceholders: Record<string, string> = {}
    for (const v of values) {
      newPlaceholders[v.placeholder_name] = v.default_value
    }
    setPlaceholders(newPlaceholders)
  }

  const handleLogout = () => {
    clearSession()
    try {
      sessionStorage.removeItem("vaultViewPrefs")
    } catch {
      // ignore
    }
    router.push("/login")
  }

  const filteredCommands = commands.filter((cmd) => {
    const matchesSearch =
      cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.command.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTags = selectedTags.length === 0 || 
      (cmd.tags && selectedTags.every(tagId => cmd.tags!.some(tag => tag.id === tagId)))
    
    return matchesSearch && matchesTags
  })

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTags =
      selectedTags.length === 0 ||
      (note.tags && selectedTags.every((tagId) => note.tags!.some((tag) => tag.id === tagId)))
    return matchesSearch && matchesTags
  })

  const hasSearch = searchQuery.trim().length > 0
  const showCommandsSection =
    viewFilter === "commands" || (hasSearch && filteredCommands.length > 0)
  const showNotesSection = viewFilter === "notes" || (hasSearch && filteredNotes.length > 0)

  // Helper function to copy to clipboard with fallback
  const copyText = async (text: string): Promise<boolean> => {
    try {
      // Try modern Clipboard API first
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        return true
      }
      
      // Fallback to older execCommand method
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      return successful
    } catch (err) {
      console.error("Copy failed:", err)
      return false
    }
  }

  const replacePlaceholders = (command: string) => {
    let result = command
    Object.entries(placeholders).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), value)
    })
    return result
  }

  const renderCommand = (cmd: Command) => {
    const processedCommand = replacePlaceholders(cmd.command)
    
    // Handle newlines for both single and multi-step commands
    const lines = processedCommand.split("\n").filter((line) => line.trim())
    
    if (cmd.is_multi_step || lines.length > 1) {
      // For multi-step commands or single commands with multiple lines
      return lines.map((line, index) => {
        const stepNumber = cmd.is_multi_step ? index + 1 : null
        const cmdSteps = commandSteps[cmd.id] || []
        const stepData = stepNumber ? cmdSteps.find(s => s.step_number === stepNumber) : null
        const comment = stepData?.comment || ''
        const subId = `${cmd.id}-${stepNumber ?? index}`

        return (
          <div key={index} className="group relative font-mono text-sm rounded mb-2">
            {stepNumber && (
              <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
                <span className="text-primary font-semibold">Step {stepNumber}</span>
              </div>
            )}
            <div className="flex items-center rounded-md bg-muted/60 px-3 py-2 pr-9">
              <span className="whitespace-pre-wrap break-words">
                {line}
              </span>
            </div>
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation()

                const success = await copyText(line)
                if (success) {
                  setCopiedSubId(subId)
                  setTimeout(() => setCopiedSubId(null), 2000)

                  toast({
                    title: "Command copied",
                    description: "The command has been copied to your clipboard.",
                  })
                } else {
                  toast({
                    title: "Copy failed",
                    description: "Unable to copy command to clipboard. Check browser permissions.",
                    variant: "destructive",
                  })
                }
              }}
              className="hidden group-hover:flex items-center justify-center absolute top-3 right-3 h-6 w-6 rounded border border-border bg-card/80 hover:bg-primary/80 hover:text-primary-foreground transition-colors"
            >
              {copiedSubId === subId ? (
                <Check className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
            {comment && (
              <div className="text-xs text-muted-foreground italic bg-primary/5 border-l-2 border-primary/20 pl-2 py-1 mt-2">
                {comment}
              </div>
            )}
          </div>
        )
      })
    }
    
    // For single commands with only one line
    const subId = `${cmd.id}-single`
    return (
      <div className="group relative font-mono text-sm rounded">
        <div className="flex items-center rounded-md bg-muted/60 px-3 py-2 pr-9">
          <span className="whitespace-pre-wrap break-words">
            {processedCommand}
          </span>
        </div>
        <button
          type="button"
          onClick={async (e) => {
            e.stopPropagation()

            const success = await copyText(processedCommand)
            if (success) {
              setCopiedSubId(subId)
              setTimeout(() => setCopiedSubId(null), 2000)

              toast({
                title: "Command copied",
                description: "The command has been copied to your clipboard.",
              })
            } else {
              toast({
                title: "Copy failed",
                description: "Unable to copy command to clipboard. Check browser permissions.",
                variant: "destructive",
              })
            }
          }}
          className="hidden group-hover:flex items-center justify-center absolute top-3 right-3 h-6 w-6 rounded border border-border bg-card/80 hover:bg-primary/80 hover:text-primary-foreground transition-colors"
        >
          {copiedSubId === subId ? (
            <Check className="w-3 h-3" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
      </div>
    )
  }

  const extractPlaceholders = (command: string): string[] => {
    const placeholderRegex = /\{\{(\w+)\}\}/g
    const matches = command.matchAll(placeholderRegex)
    return Array.from(new Set(Array.from(matches, (m) => m[1])))
  }

  const updatePlaceholder = (key: string, value: string) => {
    const newPlaceholders = { ...placeholders, [key]: value }
    setPlaceholders(newPlaceholders)
    sessionStorage.setItem("placeholders", JSON.stringify(newPlaceholders))
  }

  const copyToClipboard = async (cmd: Command, id: string) => {
    const processedCommand = replacePlaceholders(cmd.command)

    const success = await copyText(processedCommand)
    if (success) {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)

      toast({
        title: "Command copied",
        description: "The command has been copied to your clipboard.",
      })
    } else {
      toast({
        title: "Copy failed",
        description: "Unable to copy command to clipboard. Check browser permissions.",
        variant: "destructive",
      })
    }
  }

  // Get all unique placeholders from filtered commands
  const allPlaceholders = Array.from(new Set(filteredCommands.flatMap((cmd) => extractPlaceholders(cmd.command))))

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#020617]">
      {/* Header */}
      <header className="border-b border-primary/40 bg-card/95 shadow-[0_1px_0_rgba(15,23,42,0.9)]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold font-mono text-foreground">
                CMDvault
              </h1>
            </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push("/admin")} className="font-mono">
                  <Settings className="w-4 h-4 mr-2" />
                  Editor
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push("/profile")} className="font-mono">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout} className="font-mono bg-transparent">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search, type filter, and tags panel */}
        <div className="mb-8">
          <div className="rounded-2xl border border-primary/40 bg-card/95 shadow-lg shadow-black/60 hover:border-primary hover:shadow-[0_0_25px_rgba(34,197,94,0.25)] transition-colors duration-200 px-4 py-4 md:px-5 md:py-5 flex flex-col gap-4">
            {/* Top row: search + selects */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              {/* Search Input */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search commands and notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 h-11 font-mono text-sm bg-background/80 border-border/80"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto justify-end">
                {/* Placeholder set select */}
                {placeholderSets.length > 0 && (
                  <div className="w-full sm:w-64">
                    <Select value={selectedPlaceholderSet} onValueChange={setSelectedPlaceholderSet}>
                      <SelectTrigger className="w-full font-mono h-11 text-sm bg-background/80 border-border/80">
                        <SelectValue placeholder="Placeholder set: None">
                          {selectedPlaceholderSet && selectedPlaceholderSet !== "none"
                            ? `Placeholder set: ${placeholderSets.find((s) => s.id === selectedPlaceholderSet)?.name}`
                            : "Placeholder set: None"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="font-mono">None</SelectItem>
                        {placeholderSets.map((set) => (
                          <SelectItem key={set.id} value={set.id} className="font-mono">
                            {set.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* View filter: commands / notes */}
                <div className="w-full sm:w-40">
                  <Select
                    value={viewFilter}
                    onValueChange={(value) => setViewFilter(value as "commands" | "notes")}
                  >
                    <SelectTrigger className="w-full font-mono h-11 text-xs bg-background/80 border-border/80">
                      <SelectValue placeholder="View">
                        {viewFilter === "commands" ? "Commands" : "Notes"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commands" className="font-mono text-xs">Commands</SelectItem>
                      <SelectItem value="notes" className="font-mono text-xs">Notes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border/60" />

            {/* Tags row */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground font-mono tracking-[0.18em] uppercase">
                  Filter by tags
                </span>
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="text-[11px] text-muted-foreground hover:text-foreground font-mono px-2 py-0.5 rounded border border-border/60 bg-background/70"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="rounded-xl border border-primary/30 bg-background/90 shadow-[0_0_0_1px_rgba(15,23,42,0.9)] hover:border-primary hover:shadow-[0_0_18px_rgba(34,197,94,0.25)] transition-colors duration-200 px-3 py-2">
                {tags.length === 0 ? (
                  <p className="text-xs text-muted-foreground font-mono italic">No tags defined</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const active = selectedTags.includes(tag.id)
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            if (active) {
                              setSelectedTags(selectedTags.filter((id) => id !== tag.id))
                            } else {
                              setSelectedTags([...selectedTags, tag.id])
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
            </div>
          </div>
        </div>

        {/* Expand view toggle (commands & notes) */}
        {(showCommandsSection || showNotesSection) && (
          <div className="mb-3 flex justify-end">
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground font-mono bg-card/80 border border-border rounded-full px-3 py-1">
              <span className="text-[11px]">Expand view</span>
              <Switch
                checked={compactView}
                onCheckedChange={(checked) => {
                  setCompactView(checked)
                  if (!checked) setExpandedCommandId(null)
                }}
                className="scale-90"
              />
              <span className="text-[11px] opacity-70">
                {compactView ? "On" : "Off"}
              </span>
            </div>
          </div>
        )}

        {/* Commands Section (no title) */}
        {showCommandsSection ? (
          <div className="space-y-4">
            {filteredCommands.length === 0 ? (
              <div className="text-center py-12 bg-card/95 border border-primary/30 rounded-lg shadow-md shadow-black/50">
                <p className="text-muted-foreground font-mono">No commands found</p>
              </div>
            ) : (
              filteredCommands.map((cmd) => {
                const isCompact = !compactView
                const isExpanded = !isCompact || expandedCommandId === cmd.id
                const descSnippet =
                  cmd.description.length > 140
                    ? `${cmd.description.slice(0, 137)}...`
                    : cmd.description

                return (
                  <div
                    key={cmd.id}
                    className="bg-card/95 border border-primary/30 rounded-lg p-4 shadow-md shadow-black/50 hover:border-primary hover:shadow-[0_0_22px_rgba(34,197,94,0.25)] transition-colors duration-200"
                    onMouseEnter={() => {
                      if (!isCompact) return
                      setExpandedCommandId(cmd.id)
                    }}
                    onMouseLeave={() => {
                      if (!isCompact) return
                      if (expandedCommandId === cmd.id) setExpandedCommandId(null)
                    }}
                  >
                    <div className="flex items-start justify-between mb-2 cursor-default">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold font-mono text-foreground">
                            {cmd.name}
                          </h3>
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
                      </div>
                      <div className="ml-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            copyToClipboard(cmd, cmd.id)
                          }}
                          className="h-7 w-7 p-0 rounded-full font-mono"
                        >
                          {copiedId === cmd.id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-2 font-mono">
                      {isCompact && !isExpanded ? descSnippet : cmd.description}
                    </p>

                    {/* Detailed body (animated open/close) */}
                    <div
                      className={`transition-all duration-200 ease-out ${
                        isExpanded
                          ? "mt-3 max-h-[60vh] opacity-100 space-y-2 overflow-y-auto pr-1"
                          : "max-h-0 opacity-0 overflow-hidden"
                      }`}
                    >
                      <div className="space-y-1">{renderCommand(cmd)}</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        ) : null}

        {/* Notes Section (no title, compact behavior controlled by toggle) */}
        {showNotesSection ? (
          <div className="mt-8 space-y-4">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12 bg-card/95 border border-primary/30 rounded-lg shadow-md shadow-black/50">
                <p className="text-muted-foreground font-mono">No notes found</p>
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isExpanded = expandedNoteId === note.id

                // Build a short multi-line snippet of the first ~3–4 lines
                const lines = note.content.split(/\r?\n/)
                const snippetLines = lines.slice(0, 4)
                const snippetText = snippetLines.join("\n")

                return (
                  <div key={note.id} className="bg-card/95 border border-primary/30 rounded-lg p-4 mb-4 shadow-md shadow-black/50 hover:border-primary hover:shadow-[0_0_22px_rgba(34,197,94,0.25)] transition-colors duration-200">
                    <div
                      className="cursor-pointer"
                      onClick={() =>
                        setExpandedNoteId(isExpanded ? null : note.id)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold font-mono text-foreground">
                              {note.title}
                            </h3>
                            {note.tags && note.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {note.tags.map((tag) => (
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
                        </div>
                        <div className="text-muted-foreground text-xs font-mono">
                          {isExpanded ? "Hide" : "Show"}
                        </div>
                      </div>
                    </div>

                    {/* Note preview / full content */}
                    {isExpanded ? (
                      <div className="mt-3 rounded-lg border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background px-4 py-3 max-h-[60vh] overflow-auto">
                        <div className="font-mono text-sm text-foreground whitespace-pre-wrap break-words">
                          <ReactMarkdown
                            components={{
                              h1: (props: any) => (
                                <h1 className="text-xl font-bold text-primary mb-2" {...props} />
                              ),
                              h2: (props: any) => (
                                <h2 className="text-lg font-semibold text-primary mb-2" {...props} />
                              ),
                              h3: (props: any) => (
                                <h3 className="text-base font-semibold text-primary mb-1" {...props} />
                              ),
                              strong: (props: any) => (
                                <strong className="text-primary font-semibold" {...props} />
                              ),
                              code: (props: any) => {
                                const { inline, children, className, ...rest } = props
                                const text = typeof children === "string" ? children : Array.isArray(children) ? children.join("") : ""

                                // If inline code contains newlines, treat it as a block code section
                                const isMultiLineInline = inline && typeof text === "string" && text.includes("\n")

                                if (!inline || isMultiLineInline) {
                                  const langMatch = typeof className === "string" ? className.match(/language-([\w+-]+)/) : null
                                  const langLabel = langMatch?.[1]?.toUpperCase()

                                  const handleCopyBlock = async () => {
                                    if (typeof text !== "string" || text.trim().length === 0) return
                                    await copyText(text)
                                  }

                                  return (
                                    <div className="mt-3 rounded-lg bg-black/80 border border-primary/60 shadow-[0_0_18px_rgba(34,197,94,0.25)] overflow-hidden group relative">
                                      {langLabel && (
                                        <div className="flex items-center justify-between px-3 py-1 border-b border-primary/40 bg-black/70 text-[10px] font-mono tracking-widest text-primary/80 uppercase">
                                          <span>{langLabel}</span>
                                        </div>
                                      )}
                                      <button
                                        type="button"
                                        onClick={handleCopyBlock}
                                        className="hidden group-hover:flex items-center justify-center absolute top-2 right-2 h-6 w-6 rounded border border-primary/50 bg-black/80 hover:bg-primary/80 hover:text-primary-foreground transition-colors"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </button>
                                      <pre
                                        className="px-4 py-3 overflow-x-auto text-emerald-300 text-[13px] leading-relaxed"
                                        {...rest}
                                      >
                                        {children}
                                      </pre>
                                    </div>
                                  )
                                }

                                // True inline code (single line)
                                const handleCopyInline = async () => {
                                  if (typeof text !== "string" || text.trim().length === 0) return
                                  await copyText(text)
                                }

                                return (
                                  <span className="inline-flex items-center gap-1">
                                    <code
                                      className="px-1 py-0.5 rounded bg-black/70 text-emerald-400 text-[0.85em]"
                                      {...rest}
                                    >
                                      {children}
                                    </code>
                                    <button
                                      type="button"
                                      onClick={handleCopyInline}
                                      className="inline-flex items-center justify-center h-4 w-4 rounded border border-border/60 bg-black/70 hover:bg-primary/80 hover:text-primary-foreground transition-colors"
                                    >
                                      <Copy className="w-2.5 h-2.5" />
                                    </button>
                                  </span>
                                )
                              },
                              li: (props: any) => (
                                <li className="ml-4 list-disc text-sm text-foreground" {...props} />
                              ),
                              p: (props: any) => (
                                <p className="mb-2 text-sm text-foreground" {...props} />
                              ),
                            }}
                          >
                            {note.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      compactView && (
                        <p className="mt-2 text-sm text-muted-foreground font-mono whitespace-pre-line">
                          {snippetText}
                          {lines.length > snippetLines.length ? "\n..." : ""}
                        </p>
                      )
                    )}
                  </div>
                )
              })
            )}
          </div>
        ) : null}
      </main>
    </div>
  )
}
