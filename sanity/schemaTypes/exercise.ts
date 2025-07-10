import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'exercise',
  title: 'Exercise',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Exercise Name',
      type: 'string',
      validation: (Rule) => Rule.required().min(1).max(100),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule) => Rule.required().min(10).max(500),
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty Level',
      type: 'string',
      options: {
        list: [
          { title: 'Beginner', value: 'beginner' },
          { title: 'Intermediate', value: 'intermediate' },
          { title: 'Advanced', value: 'advanced' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Exercise Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Alternative text for accessibility',
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'videoURL',
      title: 'Video URL',
      type: 'url',
      description: 'Link to exercise demonstration video',
      validation: (Rule) => Rule.uri({
        scheme: ['http', 'https']
      }),
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      description: 'Whether this exercise is currently available',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      difficulty: 'difficulty',
      media: 'image',
    },
    prepare(selection) {
      const { title, difficulty, media } = selection
      return {
        title,
        subtitle: `Difficulty: ${difficulty}`,
        media,
      }
    },
  },
})
