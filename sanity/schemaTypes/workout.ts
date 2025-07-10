import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'workout',
  title: 'Workout',
  type: 'document',
  fields: [
    defineField({
      name: 'userId',
      title: 'User ID',
      type: 'string',
      description: 'Clerk user ID',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Workout Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'duration',
      title: 'Duration (seconds)',
      type: 'number',
      description: 'Workout duration in seconds',
      validation: (Rule) => Rule.required().positive().integer(),
    }),
    defineField({
      name: 'sets',
      title: 'Sets',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'setNumber',
              title: 'Set Number',
              type: 'number',
              validation: (Rule) => Rule.required().positive().integer(),
            },
            {
              name: 'exercises',
              title: 'Exercises',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'exercise',
                      title: 'Exercise',
                      type: 'reference',
                      to: [{ type: 'exercise' }],
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: 'reps',
                      title: 'Reps',
                      type: 'number',
                      validation: (Rule) => Rule.required().positive().integer(),
                    },
                    {
                      name: 'weight',
                      title: 'Weight',
                      type: 'number',
                      validation: (Rule) => Rule.positive(),
                    },
                    {
                      name: 'weightUnit',
                      title: 'Weight Unit',
                      type: 'string',
                      options: {
                        list: [
                          { title: 'Pounds (lbs)', value: 'lbs' },
                          { title: 'Kilograms (kg)', value: 'kg' },
                        ],
                        layout: 'radio',
                      },
                      validation: (Rule) => Rule.required(),
                    },
                  ],
                  preview: {
                    select: {
                      exerciseName: 'exercise.name',
                      reps: 'reps',
                      weight: 'weight',
                      weightUnit: 'weightUnit',
                    },
                    prepare(selection) {
                      const { exerciseName, reps, weight, weightUnit } = selection
                      return {
                        title: exerciseName || 'Exercise',
                        subtitle: `${reps} reps${weight ? ` • ${weight} ${weightUnit}` : ''}`,
                      }
                    },
                  },
                },
              ],
              validation: (Rule) => Rule.required().min(1),
            },
          ],
          preview: {
            select: {
              setNumber: 'setNumber',
              exerciseCount: 'exercises',
            },
            prepare(selection) {
              const { setNumber, exerciseCount } = selection
              const exerciseCountText = exerciseCount ? `${exerciseCount.length} exercises` : '0 exercises'
              return {
                title: `Set ${setNumber}`,
                subtitle: exerciseCountText,
              }
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      userId: 'userId',
      date: 'date',
      duration: 'duration',
      setCount: 'sets',
    },
    prepare(selection) {
      const { userId, date, duration, setCount } = selection
      const formattedDate = date ? new Date(date).toLocaleDateString() : 'No date'
      const minutes = Math.floor(duration / 60)
      const seconds = duration % 60
      const durationText = `${minutes}:${seconds.toString().padStart(2, '0')}`
      const setCountText = setCount ? `${setCount.length} sets` : '0 sets'
      
      return {
        title: `Workout - ${formattedDate}`,
        subtitle: `${durationText} • ${setCountText} • User: ${userId}`,
      }
    },
  },
})
