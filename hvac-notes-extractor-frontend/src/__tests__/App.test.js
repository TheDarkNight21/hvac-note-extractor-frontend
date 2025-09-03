import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';

jest.mock('axios', () => ({
  post: jest.fn(),
}));

import axios from 'axios';

describe('App - upload and get notes workflow', () => {
  test('uploads a PDF and displays returned text', async () => {
    const mockText = 'These are the extracted notes.';
    axios.post.mockResolvedValueOnce({ data: { text: mockText } });

    render(<App />);

    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/pdf file/i);
    await userEvent.upload(input, file);

    // Selected file name should appear
    expect(screen.getByText(/selected file/i)).toHaveTextContent('test.pdf');

    // Click Get Notes
    const button = screen.getByRole('button', { name: /get notes/i });
    await userEvent.click(button);

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(axios.post).toHaveBeenCalledWith(
      'http://<YOUR-SERVER-IP>:8000/api/extract-notes',
      expect.any(FormData),
      expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'multipart/form-data' }) })
    );

    // Returned text should render
    expect(await screen.findByText(mockText)).toBeInTheDocument();
  });
});
