'use client'

interface Task {
  task: string
  type?: 'learn' | 'practice' | 'build' | 'apply'
  resource?: string
}

interface Week {
  week: number
  theme?: string
  title?: string
  focus?: string
  tasks: Task[] | string[]
}

interface RoadmapTimelineProps {
  roadmap?: unknown
}

const typeConfig = {
  learn: { icon: '📚', color: '#6c63ff' },
  practice: { icon: '💪', color: '#38bdf8' },
  build: { icon: '🔨', color: '#fbbf24' },
  apply: { icon: '🎯', color: '#34d399' },
}

function normalizeTasks(tasks: Task[] | string[]): Task[] {
  if (!tasks || tasks.length === 0) return []
  if (typeof tasks[0] === 'string') {
    return (tasks as string[]).map(t => ({ task: t }))
  }
  return tasks as Task[]
}

function normalizeRoadmap(roadmap: RoadmapTimelineProps['roadmap']): Week[] {
  if (Array.isArray(roadmap)) return roadmap
  if (roadmap && typeof roadmap === 'object' && 'weeks' in roadmap && Array.isArray(roadmap.weeks)) {
    return roadmap.weeks as Week[]
  }
  if (roadmap && typeof roadmap === 'object' && 'roadmap' in roadmap && Array.isArray(roadmap.roadmap)) {
    return roadmap.roadmap as Week[]
  }
  return []
}

export default function RoadmapTimeline({ roadmap }: RoadmapTimelineProps) {
  const weeks = normalizeRoadmap(roadmap)

  if (!weeks.length) {
    return (
      <div style={{ color: 'var(--text3)', textAlign: 'center', padding: '2rem', fontSize: '0.9rem' }}>
        No roadmap data available.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {weeks.map((week, wi) => {
        const tasks = normalizeTasks(week.tasks || [])
        const title = week.theme || week.title || week.focus || `Week ${week.week}`
        const isLast = wi === weeks.length - 1

        return (
          <div key={wi} style={{ display: 'flex', gap: '1.25rem' }}>
            {/* Timeline line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--surface)',
                border: `2px solid var(--accent)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Syne', fontWeight: 800, fontSize: '0.7rem',
                color: 'var(--accent)', flexShrink: 0, zIndex: 1
              }}>
                W{week.week}
              </div>
              {!isLast && (
                <div style={{ width: 2, flex: 1, background: 'var(--border)', marginTop: '4px', marginBottom: '4px', minHeight: '24px' }} />
              )}
            </div>

            {/* Content */}
            <div style={{ paddingBottom: isLast ? 0 : '1.75rem', flex: 1 }}>
              <div style={{
                fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem',
                color: 'var(--text)', marginBottom: '0.6rem', marginTop: '5px'
              }}>
                {title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {tasks.map((task, ti) => {
                  const typeInfo = task.type ? typeConfig[task.type] : null
                  return (
                    <div key={ti} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: '8px', padding: '0.6rem 0.9rem'
                    }}>
                      <span style={{ fontSize: '0.9rem', flexShrink: 0, marginTop: '1px' }}>
                        {typeInfo?.icon || '▸'}
                      </span>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.5 }}>
                          {task.task}
                        </div>
                        {task.resource && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '2px' }}>
                            → {task.resource}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
