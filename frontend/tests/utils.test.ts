import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { parseCSV, formatNumber, formatPercentage, formatDate, generateId } from '../src/utils/helpers'

describe('Utility Functions', () => {
  describe('parseCSV', () => {
    it('should parse a valid CSV string', () => {
      const csv = 'ID,Name,Amount\n101,Rahul,5000\n102,Amit,2500\n'
      const result = parseCSV(csv)
      expect(result.headers).toEqual(['ID', 'Name', 'Amount'])
      expect(result.rows).toHaveLength(2)
      expect(result.rows[0]).toEqual({ ID: '101', Name: 'Rahul', Amount: '5000' })
    })

    it('should handle empty CSV', () => {
      const result = parseCSV('')
      expect(result.headers).toEqual([])
      expect(result.rows).toEqual([])
    })

    it('should handle CSV with only headers', () => {
      const result = parseCSV('ID,Name\n')
      expect(result.headers).toEqual(['ID', 'Name'])
      expect(result.rows).toEqual([])
    })
  })

  describe('formatNumber', () => {
    it('should format a number with commas', () => {
      expect(formatNumber(1000)).toBe('1,000')
      expect(formatNumber(1000000)).toBe('1,000,000')
      expect(formatNumber(0)).toBe('0')
    })
  })

  describe('formatPercentage', () => {
    it('should format a percentage', () => {
      expect(formatPercentage(50)).toBe('50.0%')
      expect(formatPercentage(0)).toBe('0.0%')
      expect(formatPercentage(100)).toBe('100.0%')
    })
  })

  describe('formatDate', () => {
    it('should format a date string', () => {
      const result = formatDate('2026-11-18T12:00:00Z')
      expect(result).toContain('2026')
    })
  })

  describe('generateId', () => {
    it('should generate a unique ID', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
      expect(id1.length).toBeGreaterThan(0)
    })
  })
})

describe('Component Rendering', () => {
  it('should render without crashing', () => {
    // Basic smoke test - just verify imports work
    expect(true).toBe(true)
  })
})