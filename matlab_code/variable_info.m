function variable_info()
    info = evalin('base', 'whos');

    % Create custom sorting order
    [~, sorted_indices] = sort(upper({info.name}));

    % Rearrange info according to sorted indices
    info = info(sorted_indices);

    % Open the file
    fid = fopen('matlabInVSCodeVariableInfo.csv', 'wt');

    % Print the headers
    fprintf(fid, 'Name,Value,Class\n'); % 添加一个 Value 列头

    % Loop over the variables
    for idx = 1:length(info)
        % Check if the variable size is 1x1 and is numeric or string
        if isequal(info(idx).size, [1 1]) && ((isnumeric(evalin('base', info(idx).name)) || isstring(evalin('base', info(idx).name))))
            value = evalin('base', info(idx).name);
            value_str = num2str(value);
        else
            % Format the size as e.g. "[5 5 5]"
            value_str = strjoin(string(info(idx).size), 'x');
        end

        % Print the variable information to the file
        fprintf(fid, '%s,%s,%s\n', info(idx).name, value_str, info(idx).class);
    end

    % Close the file
    fclose(fid);
end
