import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput, StyleSheet } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../navigation/AppNavigator';
import { useConsultants } from '../hooks/useConsultants';
import { useProjects } from '../hooks/useProjects';
import { useCreateAssignment } from '../hooks/useAssignments';
import { Consultant, Project } from '../types/api';

type CreateAssignmentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateAssignment'>;

const schema = yup.object({
  consultantId: yup.string().required('Please select a consultant'),
  projectId: yup.string().required('Please select a project'),
  startTime: yup.date().required('Please select start time').test('is-future', 'Start time must be in the future', (value) => {
    return value && value > new Date();
  }),
  endTime: yup.date().required('Please select end time').test('is-after-start', 'End time must be after start time', function (value) {
    const { startTime } = this.parent;
    return value && startTime && value > startTime;
  }),
  notes: yup.string().optional(),
});

type FormData = {
  consultantId: string;
  projectId: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
};

const CreateAssignmentScreen: React.FC = () => {
  const navigation = useNavigation<CreateAssignmentScreenNavigationProp>();
  const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
    resolver: yupResolver(schema) as unknown as Resolver<FormData>,
    defaultValues: {
      consultantId: '',
      projectId: '',
      startTime: new Date(),
      endTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
      notes: '',
    },
  });

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const { data: consultantsData } = useConsultants();
  const { data: projectsData } = useProjects();
  const { mutate: createAssignment, isPending } = useCreateAssignment();

  const consultants = consultantsData?.pages.flatMap(page => page.data) ?? [];
  const projects = projectsData?.pages.flatMap(page => page.data) ?? [];

  const onSubmit = (data: FormData) => {
    createAssignment(
      {
        consultantId: data.consultantId,
        projectId: data.projectId,
        startTime: data.startTime.toISOString(),
        endTime: data.endTime.toISOString(),
        notes: data.notes,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Assignment created successfully!', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        },
        onError: (error) => {
          Alert.alert('Error', error.message || 'Failed to create assignment');
        },
      }
    );
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <View style={styles.content}>
          {/* Consultant Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="person" size={14} color="#374151" /> Consultant
            </Text>
            <Controller
              control={control}
              name="consultantId"
              render={({ field: { onChange, value } }) => (
                <View style={styles.selectionList}>
                  {consultants.map((consultant: Consultant, index: number) => (
                    <TouchableOpacity
                      key={consultant.id}
                      style={[
                        styles.selectionItem,
                        value === consultant.id && styles.selectionItemActive,
                        index < consultants.length - 1 && styles.selectionItemBorder,
                      ]}
                      onPress={() => onChange(consultant.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.selectionRow}>
                        <View style={[styles.radioOuter, value === consultant.id && styles.radioOuterActive]}>
                          {value === consultant.id && <View style={styles.radioInner} />}
                        </View>
                        <View style={styles.selectionInfo}>
                          <Text style={[styles.selectionName, value === consultant.id && styles.selectionNameActive]}>
                            {consultant.name}
                          </Text>
                          <Text style={styles.selectionDetail}>{consultant.email}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
            {errors.consultantId && (
              <Text style={styles.errorText}>{errors.consultantId.message}</Text>
            )}
          </View>

          {/* Project Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="briefcase" size={14} color="#374151" /> Project
            </Text>
            <Controller
              control={control}
              name="projectId"
              render={({ field: { onChange, value } }) => (
                <View style={styles.selectionList}>
                  {projects.map((project: Project, index: number) => (
                    <TouchableOpacity
                      key={project.id}
                      style={[
                        styles.selectionItem,
                        value === project.id && styles.selectionItemActive,
                        index < projects.length - 1 && styles.selectionItemBorder,
                      ]}
                      onPress={() => onChange(project.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.selectionRow}>
                        <View style={[styles.radioOuter, value === project.id && styles.radioOuterActive]}>
                          {value === project.id && <View style={styles.radioInner} />}
                        </View>
                        <View style={styles.selectionInfo}>
                          <Text style={[styles.selectionName, value === project.id && styles.selectionNameActive]}>
                            {project.name}
                          </Text>
                          <Text style={styles.selectionDetail}>{project.client}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
            {errors.projectId && (
              <Text style={styles.errorText}>{errors.projectId.message}</Text>
            )}
          </View>

          {/* Start Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="time" size={14} color="#374151" /> Start Time
            </Text>
            <Controller
              control={control}
              name="startTime"
              render={({ field: { value } }) => (
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowStartPicker(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                  <Text style={styles.dateText}>{formatDateTime(value)}</Text>
                </TouchableOpacity>
              )}
            />
            {showStartPicker && (
              <DateTimePicker
                value={watch('startTime')}
                mode="datetime"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowStartPicker(false);
                  if (selectedDate) {
                    setValue('startTime', selectedDate);
                  }
                }}
                minimumDate={new Date()}
              />
            )}
            {errors.startTime && (
              <Text style={styles.errorText}>{errors.startTime.message}</Text>
            )}
          </View>

          {/* End Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="time" size={14} color="#374151" /> End Time
            </Text>
            <Controller
              control={control}
              name="endTime"
              render={({ field: { value } }) => (
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowEndPicker(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                  <Text style={styles.dateText}>{formatDateTime(value)}</Text>
                </TouchableOpacity>
              )}
            />
            {showEndPicker && (
              <DateTimePicker
                value={watch('endTime')}
                mode="datetime"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowEndPicker(false);
                  if (selectedDate) {
                    setValue('endTime', selectedDate);
                  }
                }}
                minimumDate={watch('startTime')}
              />
            )}
            {errors.endTime && (
              <Text style={styles.errorText}>{errors.endTime.message}</Text>
            )}
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="document-text" size={14} color="#374151" /> Notes (Optional)
            </Text>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.notesInput}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  multiline
                  placeholder="Add any additional notes..."
                  placeholderTextColor="#9CA3AF"
                  textAlignVertical="top"
                />
              )}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isPending && styles.submitButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            activeOpacity={0.8}
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <View style={styles.submitContent}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.submitText}>Create Assignment</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  selectionList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  selectionItem: {
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  selectionItemActive: {
    backgroundColor: '#EFF6FF',
  },
  selectionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioOuterActive: {
    borderColor: '#2563EB',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  selectionInfo: {
    flex: 1,
  },
  selectionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  selectionNameActive: {
    color: '#2563EB',
  },
  selectionDetail: {
    fontSize: 13,
    color: '#6B7280',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  dateText: {
    fontSize: 15,
    color: '#111827',
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    minHeight: 100,
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#93C5FD',
    shadowOpacity: 0,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 6,
  },
});

export default CreateAssignmentScreen;
