import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../hooks/useTheme';

const QuizScreen = () => {
  const { colors } = useTheme();
  const question = {
    q: 'When does Shabbat begin?',
    options: ['Sunrise', 'Sunset', 'Midnight'],
    answer: 1,
  };
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.question, { color: colors.text }]}>{question.q}</Text>
      {question.options.map((opt, idx) => (
        <TouchableOpacity
          key={opt}
          style={[
            styles.option,
            {
              borderColor: colors.border,
              backgroundColor:
                selected === null
                  ? colors.card
                  : idx === question.answer
                  ? colors.allowed + '40'
                  : idx === selected
                  ? colors.forbidden + '40'
                  : colors.card,
            },
          ]}
          onPress={() => setSelected(idx)}
        >
          <Text style={{ color: colors.text }}>{opt}</Text>
        </TouchableOpacity>
      ))}
      {selected !== null && (
        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
          {selected === question.answer ? 'Correct!' : 'Incorrect'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  question: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  option: {
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 12,
  },
});

export default QuizScreen;
